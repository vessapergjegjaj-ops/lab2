// Simple toast emitter. Use window events so any component can listen.
const show = (message, type = 'info', duration = 4000) => {
  try{
    window.dispatchEvent(new CustomEvent('toast', { detail: { message, type, duration } }))
  }catch(e){
    console.error('Toast error', e)
  }
}

export default { show }
