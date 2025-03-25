export const installDevTools = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
      await installExtension(REACT_DEVELOPER_TOOLS);
      console.log('React DevTools installed successfully');
    } catch (err) {
      console.error('Error installing React DevTools:', err);
    }
  }
};
