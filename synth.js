// Assign template elements
const optionsContainer = document.getElementById('options-container');
const synthKeysContainer = document.getElementById('synth-keys-container');
// Define scale notes, octave count and range
const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const octaveCount = 2;
const lowOctave = 4;

// ------------------------------
// Define oscillator options

// -- Compound value for synthVars.oscillator.type 
const oscillatorVars = {
  type: '',
  shape: 'sine'
};
// -- ToneJS synth output and variables
let synthVars = {
  oscillator : {
    type : 'sine',
  },
    envelope : {
    attack : 0.1,
    decay : 0.4,
    sustain : 0.8,
    release : 1.2,
  }
};
// -- UI / template values
const optionsList = [{
    title: 'Oscillator',
    type: 'type',
    values: ['default', 'am', 'fm', 'fat']
  }, {
    title: 'Shape',
    type: 'shape',
    values: ['sine', 'square', 'triangle', 'sawtooth']
  }, {
    title: 'Envelope',
    type: 'envelope',
    values: ['attack', 'decay', 'sustain', 'release']
  }];

// -- Define synth
const synth = new Tone.Synth(synthVars).toMaster();


// ------------------------------
// Initialization

// ---------------------
// -- Synth Keyboard

/**
 * Note that E and B have no sharps (#).
 * @param {string} note Selected root/white note.
 */
const noteHasSharp = note => note !== 'E' && note !== 'B';

/**
 * Build a clickable div for each note in the scale.
 * @param {string} color Synth key color to create ('white' or 'black').
 * @param {string} note  Selected root/white note.
 * @param {number} octave  Octave number of selevted note.
 */
const createKey = (color, note, octave) => {
  // If creating a black / sharp key, append '#' to the note
  note = color === 'black' ? note + '#' : note;
  // Create template synth key
  return `<div class="key ${color}" onmousedown="synthKeyPress('${note}${octave}')">${note}</div>`;
};

/**
 * Set up / render initial synth key / scale layout.
 */
const initializeSynthKeys = () => {
  // Create container to add synth keys to
  let synthKeys = '';
  // Log the current scale's octave
  let currentOctave = lowOctave;
  // Loop through scale for each octave
  for (let i = 0; i < octaveCount; i++) {
    // Build single octave scale from notes
    for (let note of notes) {
      // Group white keys and black keys together for easier styling
      // Add group to list of synth keys
      synthKeys += `
        <div class="key-group">
          ${createKey('white', note, currentOctave)}
          ${noteHasSharp(note) ? createKey('black', note, currentOctave) : ''}
        </div>`;
    }
    // Increase octave for next scale
    currentOctave++;
  }
  // Add high C to complete final octave
  synthKeys += `
    <div class="key-group">
      ${createKey('white', 'C', currentOctave)}
    </div>`;
  // Add synth keys to template
  synthKeysContainer.innerHTML = synthKeys;
};


// ---------------------
// -- Synth Options

/**
 * Build a single option input.
 * @param {string} type Type of optionsList entry.
 * @param {string} value Value of optionsList entry values.
 * @param {number} i Index of optionsList entry values.
 */
const createOption = (type, value, i) => {
  // Define default input values.
  let envelope = '';
  let inputType = 'radio';
  let additionalOptions = '';
  let valueAttribute = value;

  // Account for 'shape' svg images.
  const valueContent = (type === 'shape') ? `<img src="assets/img/shape-${value}.svg">` : value;
  
  // Define default values for envelope input values
  if (type === 'envelope') {
    // Log the envelope value to pass into updateOscillator()
    envelope = value;
    // Input values and attributes specific to number input, not radio.
    inputType = 'number';
    additionalOptions = 'step="0.1" min="0.1"';
    valueAttribute = synthVars.envelope[value];
    
  // We know the type will end up being a radio option
  // when not an 'envelope'
  } else {
    // Select the first radio option in a series
    if (i === 0) additionalOptions = 'checked'
  }
  
  return `
    <label>
      <input
        type="${inputType}"
        name="osc-${type}"
        value="${valueAttribute}"
        onchange="updateOscillator('${type}', this.value, '${envelope}')"
        ${additionalOptions} />
      ${valueContent}
    </label>`;
};

/**
 * Build an options group.
 * @param {string} type Type of optionsList entry.
 * @param {array} values Values of optionsList entry.
 * @param {string} title Template title content of optionsList entry.
 */
const createOptionGroup = (type, values, title) => {
  // Add CSS class to accommodate number input dimensions
  let envelopeClass = (type === 'envelope') ? type : '';
  // Create options
  let options = '';
  for (const [i, value] of values.entries()) {
    options += createOption(type, value, i);
  }
  return `
    <div class="options ${envelopeClass}">
      <span class="options-title">${title}</span>
      ${options}
    </div>`;
};

/**
 * Set up initial synth options layout.
 */
const initializeSynthOptions = () => {
  // Create options group for each option in initial list
  let options = '';
  for (let option of optionsList) {
    options += createOptionGroup(option.type, option.values, option.title);
  }
  // Add option groups to template
  optionsContainer.innerHTML = options;
};


// ------------------------------
// Actions

/**
 * Trigger synth note to play.
 * @param {string} note Selected synth key note.
 */
const synthKeyPress = note => {
  synth.triggerAttackRelease(note, '16n');
};

/**
 * Update global reference variables and ToneJS synth oscillator options.
 * @param {string} type Type of optionsList entry.
 * @param {string} value Value of optionsList entry values.
 * @param {string} envelope If exists, type of envelope value corresponds to.
 */
const updateOscillator = (type, value, envelope) => {
  if (envelope) updateOscillatorEnvelope(envelope, value)
  else updateOscillatorType(type, value);
};

/**
 * Update global reference variables and ToneJS synth oscillator envelope options.
 * @param {string} value Value of optionsList entry values.
 * @param {string} envelope If exists, type of envelope value corresponds to.
 */
const updateOscillatorEnvelope = (envelope, value) => {
  // Update "global" oscillator values
  synthVars.envelope[envelope] = value;
  // Update oscillator with new values
  synth.envelope[envelope] = value;
};

/**
 * Update global reference variables and ToneJS synth oscillator generic type options.
 * @param {string} type Type of optionsList entry.
 * @param {string} value Value of optionsList entry values.
 */
const updateOscillatorType = (type, value) => {
  // Account for unique case of 'default' needing to be passed as ''
  if (type === 'type' && value === 'default') value = '';
  // Update "global" oscillator values
  oscillatorVars[type] = value;
  synthVars.oscillator[type] = value;
  // Update oscillator with new values
  synth.oscillator.type = `${oscillatorVars.type}${oscillatorVars.shape}`;
};


// ------------------------------
// Build Template 

/**
 * Build / render initial synth key / scale / options layout.
 */
const initializeSynth = () => {
  // Build synth template
  initializeSynthKeys();
  initializeSynthOptions();
};

initializeSynth();