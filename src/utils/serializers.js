
const toPublicUser = (row) => ({
  id: row.id,
  firstname: row.firstname,
  lastname: row.lastname,
  email: row.email,
  isActive: Boolean(row.isActive),
  role: row.role,
  createAt: row.createAt,
  updateAt: row.updateAt,
});

const toBlogWithAuthor = (row) => ({
  id: row.id,
  blogTitle: row.blogTitle,
  blog: row.blog,
  category: row.category,
  createAt: row.createAt,
  updateAt: row.updateAt,
  author: {
    id: row.authorId,
    firstname: row.authorFirstname,
    lastname: row.authorLastname,
  },
});

module.exports = { toPublicUser, toBlogWithAuthor };
