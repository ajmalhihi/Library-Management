import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Layout } from '../components/Layout';
import {
  Plus, Edit3, Trash2, X, Book,
  CheckCircle2, HelpCircle, AlertCircle, CheckCircle, Image
} from 'lucide-react';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchBooks = async () => {
    try {
      const res = await API.get('admin/books/');
      setBooks(res.data);
    } catch (err) {
      setError('Failed to fetch books repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const validateForm = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Book title is required';
    if (!author.trim()) errs.author = 'Author name is required';
    if (!genre.trim()) errs.genre = 'Genre category is required';
    if (!description.trim()) errs.description = 'Book description is required';
    if (imageUrl && !imageUrl.startsWith('http')) errs.image_url = 'Image URL must start with http or https';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle(''); setAuthor(''); setGenre('');
    setDescription(''); setImageUrl(''); setIsAvailable(true);
    setFormErrors({}); setError(''); setSuccess('');
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setIsEditing(true);
    setEditingId(book.id);
    setTitle(book.title); setAuthor(book.author);
    setGenre(book.genre); setDescription(book.description);
    setImageUrl(book.image_url || ''); setIsAvailable(book.is_available);
    setFormErrors({}); setError(''); setSuccess('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); setError('');
    if (!validateForm()) return;

    setSubmitLoading(true);
    const bookData = {
      title, author, genre, description,
      image_url: imageUrl || null,
      is_available: isAvailable
    };

    try {
      if (isEditing) {
        await API.put(`admin/books/${editingId}/`, bookData);
        setSuccess(`Successfully updated '${title}'.`);
      } else {
        await API.post('admin/books/', bookData);
        setSuccess(`Successfully added '${title}' to inventory.`);
      }
      setModalOpen(false);
      fetchBooks();
    } catch (err) {
      if (err.response?.data) {
        setFormErrors(err.response.data);
        setError(err.response.data.error || 'Please correct the errors.');
      } else {
        setError('Failed to save book.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (bookId, bookTitle) => {
    setSuccess(''); setError('');
    if (!window.confirm(`Delete '${bookTitle}' from inventory?`)) return;
    try {
      await API.delete(`admin/books/${bookId}/`);
      setSuccess(`Successfully deleted '${bookTitle}'.`);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to delete '${bookTitle}'.`);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">Manage Books</h2>
          <p className="text-slate-400 text-sm mt-1">Audit, register, update, and remove catalogue books</p>
        </div>
        <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 shrink-0">
          <Plus className="h-4 w-4" /> Add New Book
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" /><span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden animate-pulse">
          <div className="h-12 bg-slate-900 border-b border-slate-800"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border-b border-slate-900 flex justify-between">
              <div className="h-4 bg-slate-900 rounded w-1/4"></div>
              <div className="h-4 bg-slate-900 rounded w-1/12"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl shadow-slate-950/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Book Details</th>
                  <th className="py-4 px-6">Genre</th>
                  <th className="py-4 px-6">Image</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/80 text-sm">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="bg-indigo-500/10 p-2 border border-indigo-500/25 text-indigo-400 rounded-lg shrink-0">
                          <Book className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 m-0">{book.title}</h4>
                          <span className="text-xs text-slate-400 font-medium">by {book.author}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex px-2.5 py-0.5 rounded bg-slate-900 text-xs font-semibold text-slate-400 border border-slate-800">
                        {book.genre}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {book.image_url ? (
                        <img src={book.image_url} alt={book.title} className="h-10 w-10 rounded-lg object-cover border border-slate-700" />
                      ) : (
                        <span className="text-slate-600 text-xs italic">No image</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {book.is_available ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded-full">
                          <HelpCircle className="h-3 w-3" /> Borrowed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEditModal(book)} className="p-2 bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 rounded-xl text-slate-400 transition-all">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(book.id, book.title)} className="p-2 bg-slate-900 hover:bg-rose-600 hover:text-white border border-slate-800 rounded-xl text-slate-400 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between sticky top-0">
              <h3 className="text-lg font-bold text-white m-0">
                {isEditing ? 'Edit Book' : 'Add New Book'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Book Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-600 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${formErrors.title ? 'border-rose-500' : 'border-slate-800'}`}
                  placeholder="e.g., Clean Architecture" disabled={submitLoading} />
                {formErrors.title && <p className="mt-1 text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.title?.join ? formErrors.title.join(' ') : formErrors.title}</p>}
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Author Name</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-600 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${formErrors.author ? 'border-rose-500' : 'border-slate-800'}`}
                  placeholder="e.g., Robert C. Martin" disabled={submitLoading} />
                {formErrors.author && <p className="mt-1 text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.author?.join ? formErrors.author.join(' ') : formErrors.author}</p>}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Genre / Category</label>
                <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-600 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${formErrors.genre ? 'border-rose-500' : 'border-slate-800'}`}
                  placeholder="e.g., Software Architecture" disabled={submitLoading} />
                {formErrors.genre && <p className="mt-1 text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.genre?.join ? formErrors.genre.join(' ') : formErrors.genre}</p>}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Image URL <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Image className="h-4 w-4" />
                  </div>
                  <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-600 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all ${formErrors.image_url ? 'border-rose-500' : 'border-slate-800'}`}
                    placeholder="https://example.com/book-cover.jpg" disabled={submitLoading} />
                </div>
                {imageUrl && !formErrors.image_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={imageUrl} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-slate-700"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    <span className="text-xs text-slate-500">Image preview</span>
                  </div>
                )}
                {formErrors.image_url && <p className="mt-1 text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.image_url}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Summary Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
                  className={`w-full px-4 py-2.5 bg-slate-900 border rounded-xl text-slate-100 placeholder-slate-600 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none ${formErrors.description ? 'border-rose-500' : 'border-slate-800'}`}
                  placeholder="Brief summary of book content..." disabled={submitLoading} />
                {formErrors.description && <p className="mt-1 text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.description?.join ? formErrors.description.join(' ') : formErrors.description}</p>}
              </div>

              {/* Available checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input id="modal-is-available" type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer" disabled={submitLoading} />
                <label htmlFor="modal-is-available" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Mark as available in catalogue
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-900 mt-6">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-bold transition-all" disabled={submitLoading}>
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold transition-all flex items-center gap-2">
                  {submitLoading ? (
                    <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
                  ) : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminBooks;