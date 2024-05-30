import express from 'express';
import { createRole, deleteRole, getAllRoles, updateRole } from '../controllers/role.controller.js';
import { verifyAdmin } from '../utils/verifyToken.js';

const router =express.Router();

router.post('/create',verifyAdmin,createRole)

router.put('/update/:id',verifyAdmin, updateRole)

router.get('/getAll',getAllRoles);

router.delete('/deleteRole/:id',deleteRole)

export default router;