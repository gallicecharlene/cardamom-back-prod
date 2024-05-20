export default (err, req, res, next) => {
    let { status, message } = err;

    if (!status) {
        status = 500;
    }

    if (status === 500) {
        console.error('Internal Server Error:', err);
        message = 'Internal Server Error';
    }

    // if (req.format === 'html') {
    //     return res.status(status).render('error', {
    //         httpStatus: status,
    //         message,
    //     });
    // }

    return res.status(status).json({ error: message });
};
