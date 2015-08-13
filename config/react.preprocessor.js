import ReactTools from 'react-tools';

export default {
  process: function(src) {
    return ReactTools.transform(src);
  }
};
