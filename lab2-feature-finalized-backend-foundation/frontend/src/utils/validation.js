export function isEmail(email){
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email)
}

export function validateLogin({ email, password }){
  const errors = {}
  if(!email) errors.email = 'Email is required'
  else if(!isEmail(email)) errors.email = 'Email is invalid'

  if(!password) errors.password = 'Password is required'
  else if(password.length < 6) errors.password = 'Password must be at least 6 characters'

  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateRegister({ firstName, lastName, email, password }){
  const errors = {}
  if(!firstName) errors.firstName = 'First name is required'
  if(!lastName) errors.lastName = 'Last name is required'
  if(!email) errors.email = 'Email is required'
  else if(!isEmail(email)) errors.email = 'Email is invalid'
  if(!password) errors.password = 'Password is required'
  else if(password.length < 6) errors.password = 'Password must be at least 6 characters'

  return { valid: Object.keys(errors).length === 0, errors }
}
