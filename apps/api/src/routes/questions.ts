import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get questions - not implemented' }));
router.get('/:id', (req, res) => res.json({ message: 'Get question - not implemented' }));
router.post('/', (req, res) => res.json({ message: 'Create question - not implemented' }));
router.put('/:id', (req, res) => res.json({ message: 'Update question - not implemented' }));
router.delete('/:id', (req, res) => res.json({ message: 'Delete question - not implemented' }));

export default router;
