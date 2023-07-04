module.exports = {
  '*.ts': [() => 'eslint --cache --fix'],
  '*.{ts,json}': ['npx prettier --write --cache ./packages --loglevel error'],
};
