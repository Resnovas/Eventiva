import { Request, Response } from "express";

/**
 * @swagger
 *
 * /login:
 *   post:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         in: formData
 *         required: true
 *         type: string
 */
function getDomain(req: Request, res: Response) {
    // #swagger.start

    /*
        #swagger.path = '/domain/{id}'
        #swagger.method = 'get'
        #swagger.description = 'Get a domain from the database.'
        #swagger.produces = ['application/json']
    */
    
    /*  #swagger.parameters['id'] = {
            in: 'path',
            type: 'integer',
            description: 'User ID.' } */
    const dataId = req.params.id

    /*  #swagger.parameters['obj'] = {
            in: 'query',
            description: 'User data.',
            schema: { $ref: '#/definitions/AddUser' }
    } */
    const dataObj = req.query.obj
    
    if (dataId || dataObj)
        return res.status(200).send(true)    // #swagger.responses[200]
    return res.status(404).send(false)       // #swagger.responses[404]
    // #swagger.end
}

export const handler = getDomain