import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get messages - not implemented' }));
router.get('/:id', (req, res) => res.json({ message: 'Get message - not implemented' }));
router.post('/', (req, res) => res.json({ message: 'Create message - not implemented' }));
router.put('/:id', (req, res) => res.json({ message: 'Update message - not implemented' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete message - not implemented' }));

export default router;
