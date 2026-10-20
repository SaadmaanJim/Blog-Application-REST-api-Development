const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ROLES = require('../constants/roles');
const { toBlogWithAuthor } = require('../utils/serializers');

const BLOG_WITH_AUTHOR_SQL = `
  SELECT b.id, b.blogTitle, b.blog, b.category, b.createAt, b.updateAt,
         u.id AS authorId, u.firstname AS authorFirstname, u.lastname AS authorLastname
  FROM blogs b
  JOIN users u ON u.id = b.userId`;

const findBlogWithAuthor = async (id) => {
  const [rows] = await db.execute(`${BLOG_WITH_AUTHOR_SQL} WHERE b.id = ?`, [id]);
  return rows[0];
};

const canModify = (user, blogOwnerId) =>
  user.role === ROLES.ADMIN || user.id === blogOwnerId;



const getAllBlogs = asyncHandler(async (req, res) => {
  const { title, category } = req.query;
  const conditions = [];
  const params = [];

  if (title) {
    conditions.push('b.blogTitle LIKE ?');
    params.push(`%${title}%`);
  }
  if (category) {
    conditions.push('b.category = ?');
    params.push(category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `${BLOG_WITH_AUTHOR_SQL} ${where} ORDER BY b.createAt DESC, b.id DESC`,
    params
  );
  return res.status(200).json(rows.map(toBlogWithAuthor));
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await findBlogWithAuthor(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: 'Blog not found.' });
  }
  return res.status(200).json(toBlogWithAuthor(blog));
});



const createBlog = asyncHandler(async (req, res) => {
  const { blogTitle, blog, category } = req.body;

  // userId always comes from the token, never from the client.
  const [result] = await db.execute(
    'INSERT INTO blogs (userId, blogTitle, blog, category) VALUES (?, ?, ?, ?)',
    [req.user.id, blogTitle, blog, category]
  );

  const created = await findBlogWithAuthor(result.insertId);
  return res.status(201).json({ message: 'Blog created successfully.', blog: toBlogWithAuthor(created) });
});

const updateBlog = asyncHandler(async (req, res) => {
  const [rows] = await db.execute('SELECT id, userId FROM blogs WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Blog not found.' });
  }
  if (!canModify(req.user, rows[0].userId)) {
    return res.status(403).json({ message: 'You are not authorized to update this blog.' });
  }

  const { blogTitle, blog, category } = req.body;
  await db.execute(
    'UPDATE blogs SET blogTitle = ?, blog = ?, category = ? WHERE id = ?',
    [blogTitle, blog, category, req.params.id]
  );

  const updated = await findBlogWithAuthor(req.params.id);
  return res.status(200).json({ message: 'Blog updated successfully.', blog: toBlogWithAuthor(updated) });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const [rows] = await db.execute('SELECT id, userId FROM blogs WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: 'Blog not found.' });
  }
  if (!canModify(req.user, rows[0].userId)) {
    return res.status(403).json({ message: 'You are not authorized to delete this blog.' });
  }

  await db.execute('DELETE FROM blogs WHERE id = ?', [req.params.id]);
  return res.status(200).json({ message: 'Blog deleted successfully.' });
});

module.exports = { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
