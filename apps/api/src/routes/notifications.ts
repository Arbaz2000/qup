import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get notifications - not implemented' }));
router.get('/:id', (req, res) => res.json({ message: 'Get notification - not implemented' }));
router.put('/:id/read', (req, res) => res.json({ message: 'Mark as read - not implemented' }));
router.put('/read-all', (req, res) => res.json({ message: 'Mark all as read - not implemented' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete notification - not implemented' }));

export default router;
