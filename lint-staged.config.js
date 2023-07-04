module.exports = {
  '*.ts': [() => 'tsc --skipLibCheck --noEmit', 'eslint --cache --fix'],
  '*.{ts,json}': ['npx prettier --write --cache ./packages --loglevel error'],
};
