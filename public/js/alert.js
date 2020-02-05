const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentNode.removeChild(el);
};
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</dip>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  setTimeout(hideAlert, 5000);
};
