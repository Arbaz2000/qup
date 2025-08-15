import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get files - not implemented' }));
router.get('/:id', (req, res) => res.json({ message: 'Get file - not implemented' }));
router.post('/upload', (req, res) => res.json({ message: 'Upload file - not implemented' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete file - not implemented' }));

export default router;
