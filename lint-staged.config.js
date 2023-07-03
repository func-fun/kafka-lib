module.exports = {
  '*.ts': [() => 'tsc --skipLibCheck --noEmit', 'eslint --cache --fix'],
  '*.{ts,json}': ['npx prettier --write --cache ./src --loglevel error'],
};
