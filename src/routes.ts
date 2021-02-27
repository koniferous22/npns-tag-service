import { Router } from 'express';
import { Tag } from './entities/Tag';

const router = Router();

router.use('/tag-forest', async (req, res) => {
  // TODO error handling & API doc
  const forest = await req.em.getTreeRepository(Tag).findTrees();
  res.status(200).send(forest);
});

export { router };
