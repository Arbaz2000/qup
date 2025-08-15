import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get channels - not implemented' }));
router.get('/:id', (req, res) => res.json({ message: 'Get channel - not implemented' }));
router.post('/', (req, res) => res.json({ message: 'Create channel - not implemented' }));
router.put('/:id', (req, res) => res.json({ message: 'Update channel - not implemented' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete channel - not implemented' }));

export default router;
