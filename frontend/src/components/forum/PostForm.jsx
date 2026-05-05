import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPhotograph } from 'react-icons/hi';

const PostForm = ({ onSubmit, onClose, isLoading, initialData }) => {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [niche, setNiche] = useState(initialData?.niche || '');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [selectedTag, setSelectedTag] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.attachment || null);

  const availableTags = ['SEO', 'thumbnails', 'monetization', 'editing', 'analytics', 'growth', 'collab', 'general'];
  const availableNiches = ['Gaming', 'Cooking', 'Tech', 'Education', 'Vlogs', 'Music', 'Fitness', 'Art'];

  const handleAddTag = () => {
    if (selectedTag && !tags.includes(selectedTag) && tags.length < 5) {
      setTags([...tags, selectedTag]);
      setSelectedTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large (max 5MB)');
        return;
      }
      setAttachment(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (attachment) {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('niche', niche);
      // Append tags as individual fields or a JSON string
      formData.append('tags', JSON.stringify(tags));
      if (attachment) formData.append('attachment', attachment);
      onSubmit(formData);
    } else {
      onSubmit({ title: title.trim(), content: content.trim(), niche, tags });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition">
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                placeholder="What's your question or tip?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Niche (Category)</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                required
              >
                <option value="">Select a niche</option>
                {availableNiches.map(n => (
                  <option key={n} value={n.toLowerCase()}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm resize-none"
                placeholder="Share your thoughts in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (max 5)</label>
              <div className="flex gap-2">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Select a tag</option>
                  {availableTags.filter(t => !tags.includes(t)).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!selectedTag}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-40 transition text-sm font-medium"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full flex items-center gap-1.5 font-medium">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition">
                        <HiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Attachment (Optional)</label>
              {!previewUrl ? (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <HiPhotograph className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG, JPEG (MAX. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !title.trim() || !content.trim() || !niche}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition text-sm font-semibold shadow-md"
              >
                {isLoading ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save Changes' : 'Create Post')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostForm;