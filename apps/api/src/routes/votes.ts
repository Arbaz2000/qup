import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get votes - not implemented' }));
router.post('/', (req, res) => res.json({ message: 'Create vote - not implemented' }));
router.put('/:id', (req, res) => res.json({ message: 'Update vote - not implemented' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete vote - not implemented' }));

export default router;
