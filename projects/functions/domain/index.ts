// import { Request, Response } from 'express';
// import PostHog from 'posthog-node';
// /**
//  * @swagger
//  *
//  * /domain:
//  *   post:
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - name: username
//  *         in: query
//  *         required: true
//  *         type: string
//  *       - name: password
//  *         in: query
//  *         required: true
//  *         type: string
//  *
//  * Responds to any HTTP request.
//  *
//  * @param {!express:Request} req HTTP request context.
//  * @param {!express:Response} res HTTP response context.
//  */

// const client = new PostHog('phc_9qsTJL1pzfiTBe4yOYXGEvhK18sy07Oov14pHBQEspA', {
//   host: 'https://app.posthog.com',
// });
// export const handler = (req: Request, res: Response) => {
//   const message = req.query.message || req.body.message || 'Hello World!';
//   client.capture({
//     distinctId: 'test-id',
//     event: 'test-event',
//   });
//   res.status(200).send(message);
// };
