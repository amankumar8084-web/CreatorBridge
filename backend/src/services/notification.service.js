const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class NotificationService {
  async createNotification(recipientId, type, title, message, data = {}) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        type,
        title,
        message,
        data
      });
      
      // Cache the notification for real-time delivery
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.publish(
          `notifications:${recipientId}`,
          JSON.stringify(notification)
        );
      }
      
      logger.info(`Notification created for ${recipientId}: ${title}`);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      return null;
    }
  }

  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Notification.countDocuments({ recipient: userId });
      
      return {
        notifications,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Failed to fetch notifications:', error);
      return { notifications: [], total: 0, page: 1, pages: 0 };
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      return null;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );
      return true;
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
      return false;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });
      return count;
    } catch (error) {
      logger.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
      return true;
    } catch (error) {
      logger.error('Failed to delete notification:', error);
      return false;
    }
  }

  async notifyFollow(followerId, followingId) {
    const follower = await User.findById(followerId).select('name');
    if (follower) {
      await this.createNotification(
        followingId,
        'follow',
        'New Follower',
        `${follower.name} started following you`,
        { userId: followerId }
      );
    }
  }

  async notifyUpvote(post, userId) {
    if (post.author.toString() !== userId) {
      await this.createNotification(
        post.author,
        'upvote',
        'Post Upvoted',
        `${userId} upvoted your post: "${post.title.substring(0, 50)}"`,
        { postId: post._id }
      );
    }
  }

  async notifyComment(post, comment, userId) {
    if (post.author.toString() !== userId) {
      await this.createNotification(
        post.author,
        'comment',
        'New Comment',
        `${userId} commented on your post: "${comment.content.substring(0, 100)}"`,
        { postId: post._id, commentId: comment._id }
      );
    }
  }
}

module.exports = new NotificationService();