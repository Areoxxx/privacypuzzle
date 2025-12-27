#!/usr/bin/env node
const { program } = require('commander');
const fs = require('node:fs');
const path = require('node:path');
const figlet = require('figlet');
const kleur = require('kleur');
const gradient = require('gradient-string');
const { prompt } = require('enquirer');
const { createSpinner } = require('nanospinner');
const Table = require('cli-table3');

const { encrypt, decrypt } = require('./lib/encryption');
const { hideData, extractData } = require('./lib/steganography');
const { generateNonogram, renderNonogramPuzzle } = require('./lib/puzzleGenerator');
const { getFullEducationalContent, getIntroduction, getSteganographyRisks, getPasswordBestPractices, getPrivacyPrinciples } = require('./lib/education');

const OUTPUT_DIR = path.join(process.cwd(), 'output');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log(gradient.rainbow(figlet.textSync('PrivacyPuzzle', { font: 'Slant' })));

program
  .name('privacypuzzle')
  .description(kleur.yellow('Educational tool for encryption and steganography integrated in digital puzzles'))
  .version('1.2.0', '-v, --version')
  .addHelpText('before', kleur.green(getIntroduction()));

program.on('--help', () => {
  console.log(kleur.bold('\nUsage Examples:'));
  const table = new Table({
    head: ['Command', 'Description', 'Example'],
    colWidths: [15, 40, 50],
    style: { head: ['cyan'], border: ['gray'] }
  });
  table.push(
    ['hide', 'Hide message in puzzle', 'node index.js hide -m "Secret" -p "Pass123"'],
    ['reveal', 'Reveal hidden message', 'node index.js reveal -i output/puzzle.png -p "Pass123"'],
    ['educate', 'Show educational content', 'node index.js educate']
  );
  console.log(table.toString());
  console.log(kleur.magenta().bold('💡 Tip: Run commands interactively if options are omitted!'));
});

// Hide command
program
  .command('hide')
  .description('Hide a confidential message in a nonogram puzzle')
  .option('-m, --message <string>', 'Message to hide')
  .option('-p, --password <string>', 'Password for AES-256-GCM encryption')
  .option('-s, --size <number>', 'Grid size (width/height)', '15')
  .option('-c, --cell-size <number>', 'Cell size in pixels', '40')
  .option('-o, --output <filename>', 'Output filename', 'puzzle')
  .action(async (options) => {
    let { message, password, size, cellSize, output } = options;

    if (!message || !password) {
      const answers = await prompt([
        { type: 'input', name: 'message', message: kleur.blue('Enter the confidential message:'), skip: () => !!message },
        { type: 'password', name: 'password', message: kleur.blue('Enter a secure password:'), skip: () => !!password }
      ]);
      message = answers.message || message;
      password = answers.password || password;
    }

    try {
      const spinner = createSpinner('Generating nonogram puzzle...').start();
      size = parseInt(size, 10);
      cellSize = parseInt(cellSize, 10);
      if (isNaN(size) || size < 5 || size > 30) throw new Error('Size must be between 5 and 30.');

      const { rowHints, colHints } = generateNonogram(size, size, 0.45);
      spinner.success({ text: 'Nonogram generated!' });

      const spinner2 = createSpinner('Rendering puzzle image...').start();
      const puzzleImage = await renderNonogramPuzzle(rowHints, colHints, cellSize);
      spinner2.success({ text: 'Image rendered!' });

      const spinner3 = createSpinner('Encrypting message...').start();
      const encryptedMessage = encrypt(message, password);
      spinner3.success({ text: 'Message encrypted!' });

      const spinner4 = createSpinner('Hiding data...').start();
      const stegoImage = await hideData(puzzleImage, encryptedMessage);
      spinner4.success({ text: 'Data hidden!' });

      const outputPath = path.join(OUTPUT_DIR, `${output}.png`);
      fs.writeFileSync(outputPath, stegoImage);

      console.log(kleur.green().bold(`✅ Puzzle generated successfully! File: ${outputPath}`));
    } catch (error) {
      console.log(kleur.red().bold(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('reveal')
  .description('Extract and decrypt a hidden message from a puzzle image')
  .option('-i, --input <path>', 'Path to PNG image')
  .option('-p, --password <string>', 'Password used for encryption')
  .action(async (options) => {
    let { input, password } = options;

    if (!input || !password) {
      const answers = await prompt([
        { type: 'input', name: 'input', message: kleur.blue('Path to PNG image:'), skip: () => !!input },
        { type: 'password', name: 'password', message: kleur.blue('Enter the password:'), skip: () => !!password }
      ]);
      input = answers.input || input;
      password = answers.password || password;
    }

    try {
      if (!fs.existsSync(input)) throw new Error('Image file does not exist.');

      const spinner = createSpinner('Extracting hidden data...').start();
      const imageBuffer = fs.readFileSync(input);
      const extractedEncrypted = await extractData(imageBuffer);
      spinner.success({ text: 'Data extracted!' });

      const spinner2 = createSpinner('Decrypting message...').start();
      const decryptedMessage = decrypt(extractedEncrypted, password);
      spinner2.success({ text: 'Message decrypted!' });

      console.log(kleur.green().bold(`✅ Confidential message: "${decryptedMessage}"`));
    } catch (error) {
      console.log(kleur.red().bold(`❌ Error: ${error.message}`));
      if (error.message.includes('authentication')) {
        console.log(kleur.red('Possible causes: wrong password or corrupt image.'));
      }
      process.exit(1);
    }
  });

program
  .command('educate')
  .description('Display educational content on privacy, cryptography, and steganography')
  .action(() => {
    console.log(kleur.cyan().bold('\nEducational Content Sections:'));
    const table = new Table({
      head: ['Section', 'Description'],
      colWidths: [30, 70],
      style: { head: ['magenta'], border: ['gray'] }
    });
    table.push(
      ['Steganography Risks', getSteganographyRisks().substring(0, 100) + '...'],
      ['Password Best Practices', getPasswordBestPractices().substring(0, 100) + '...'],
      ['Privacy Principles', getPrivacyPrinciples().substring(0, 100) + '...']
    );
    console.log(table.toString());

    console.log(kleur.yellow('\nFull Content:'));
    console.log(gradient.fruit(getFullEducationalContent()));
  });

program.parse(process.argv);
if (!process.argv.slice(2).length) program.outputHelp();
