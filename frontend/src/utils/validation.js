export function isEmail(email) {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email)
}

export function validateLogin({ identifier, password }) {
  const errors = {}
  if (!identifier) errors.identifier = 'Email or username is required'
  if (!password) errors.password = 'Password is required'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters'

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateRegister({ firstName, lastName, username, email, password }) {
  const errors = {}
  if (!firstName) errors.firstName = 'First name is required'
  if (!lastName) errors.lastName = 'Last name is required'
  if (!username) errors.username = 'Username is required'
  else if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username)) errors.username = 'Username is invalid'
  if (!email) errors.email = 'Email is required'
  else if (!isEmail(email)) errors.email = 'Email is invalid'
  if (!password) errors.password = 'Password is required'
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters'

  return { valid: Object.keys(errors).length === 0, errors }
}
