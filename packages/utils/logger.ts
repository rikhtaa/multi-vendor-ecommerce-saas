type LogInput = {
  type: "success" | "error" | "info" | "warning"
  message: string
  source: string
}

export const sendLog = ({ type, message, source }: LogInput) => {
  const timestamp = new Date().toISOString()
  const log = `[${timestamp}] [${type.toUpperCase()}] [${source}] ${message}`

  if (type === "error") {
    console.error(log)
  } else {
    console.log(log)
  }
}