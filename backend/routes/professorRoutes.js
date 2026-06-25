const express = require('express');
const {
  getProfessors,
  getProfessorById,
  createProfessor,
  updateProfessor,
  deleteProfessor,
} = require('../controllers/professorController');

const router = express.Router();

router.route('/').get(getProfessors).post(createProfessor);
router.route('/:id').get(getProfessorById).patch(updateProfessor).delete(deleteProfessor);

module.exports = router;
