const isDevMode = process.env.NODE_ENV === 'development'

const noOp = () => {}

const log = isDevMode ? console.log.bind(console) : noOp
const warn = isDevMode ? console.warn.bind(console) : noOp
const error = isDevMode ? console.error.bind(console) : noOp

export const logger = {
    log,
    warn,
    error,
}