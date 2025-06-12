const turretTypes = ['Beam', 'Cannon', 'Flak', 'Coilgun', 'Railgun', 'Ion', 'Shrapnel', 'Blaster', 'Miner', 'Strip Miner', 'Precision Miner', 'Ice Miner'];

const mediumTurretTypes = ['Beam-M', 'Cannon-M', 'Coilgun-M', 'Railgun-M', 'Ion-M', 'Blaster-M'];

const rigTypes = {
  WEP: ['AP Rounds', 'HE Rounds', 'Ion Rounds', 'Heat Sink', 'Nullifier Rounds', 'Enhanced Servos', 'Rapid Bolt', 'Swift Bolt', 'Heavy Bolt', 'Targeter'],
  DEF: ['Composite Armor', 'Reflective Panels', 'Reflective Plating', 'Reinforced Hull', 'Skeletonized Chassis', 'Ultralight Chassis', 'Enhanced Deflectors', 'Hardlight Shields', 'Shield Amplifier', 'Patcher Nanobots', 'Sensor Booster'],
  ENG: ['Fuel Injector', 'Lightweight Engines', 'Warp Charger', 'Warp Field Amplifier', 'Engine Gimbals', 'Exhaust Restrictor'],
  RCT: ['Battery', 'Parallel Circuits']
};

const subsystemTypes = [
  'Disruptor', 'Lightburner', 'Energy Booster', 'Hull Booster',
  'Light Shield Repairer', 'Medium Shield Repairer', 'Heavy Shield Repairer',
  'Light Hull Repairer', 'Medium Hull Repairer', 'Heavy Hull Repairer',
  'Light Sensor Jammer', 'Medium Sensor Jammer', 'Heavy Sensor Jammer',
  'Overclocker', 'Stasis Field', 'Servo Surge', 'Target Painter'
];

let shipData = {};

async function fetchData() {
  const res = await fetch('DATA.txt');
  const text = await res.text();
  const lines = text.trim().split('\n');

  lines.forEach(line => {
    const [name, wep, def, eng, rct, turrets, subsystems, shipClass, medium = 0] = line.split(',').map(s => s.trim());
    if (!shipData[shipClass]) shipData[shipClass] = [];
    shipData[shipClass].push({
      name, wep: +wep, def: +def, eng: +eng, rct: +rct,
      turrets: +turrets, subsystems: +subsystems,
      medium: +medium
    });
  });

  const classSelect = document.getElementById('ship-class');
  classSelect.innerHTML = '';

  const placeholderOption = document.createElement('option');
  placeholderOption.value = '';
  placeholderOption.textContent = 'Select a Class';
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  classSelect.appendChild(placeholderOption);

  Object.keys(shipData).forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    classSelect.appendChild(opt);
  });

  const shipSelect = document.getElementById('ship-name');
  shipSelect.innerHTML = '';
  const shipSelectPlaceholder = document.createElement('option');
  shipSelectPlaceholder.value = '';
  shipSelectPlaceholder.textContent = 'Select a Ship';
  shipSelectPlaceholder.disabled = true;
  shipSelectPlaceholder.selected = true;
  shipSelect.appendChild(shipSelectPlaceholder);

  document.getElementById('ship-image').src = '/Resources/STEEL.png';

  hideAllTitlesAndButtons();
}

function hideAllTitlesAndButtons() {
  document.getElementById('rig-title-WEP').style.display = 'none';
  document.getElementById('rig-title-DEF').style.display = 'none';
  document.getElementById('rig-title-ENG').style.display = 'none';
  document.getElementById('rig-title-RCT').style.display = 'none';

  // Hide turret section header
  const turretHeaders = [...document.querySelectorAll('h3')].filter(h3 => h3.textContent === 'Turrets');
  turretHeaders.forEach(h => (h.style.display = 'none'));

  // Hide subsystem section header
  const subsysHeaders = [...document.querySelectorAll('h3')].filter(h3 => h3.textContent === 'Subsystems');
  subsysHeaders.forEach(h => (h.style.display = 'none'));

  const applyButton = document.querySelector('button[onclick="applyFirstTurretToAll()"]');
  if (applyButton) applyButton.style.display = 'none';
}

function updateShipList() {
  const shipClass = document.getElementById('ship-class').value;
  const shipSelect = document.getElementById('ship-name');
  shipSelect.innerHTML = '';

  if (!shipClass || !shipData[shipClass]) {
    const shipSelectPlaceholder = document.createElement('option');
    shipSelectPlaceholder.value = '';
    shipSelectPlaceholder.textContent = 'Select a Ship';
    shipSelectPlaceholder.disabled = true;
    shipSelectPlaceholder.selected = true;
    shipSelect.appendChild(shipSelectPlaceholder);

    document.getElementById('ship-image').src = '/Resources/STEEL.png';
    hideAllTitlesAndButtons();
    return;
  }

  const shipSelectPlaceholder = document.createElement('option');
  shipSelectPlaceholder.value = '';
  shipSelectPlaceholder.textContent = '-';
  shipSelectPlaceholder.disabled = true;
  shipSelectPlaceholder.selected = true;
  shipSelect.appendChild(shipSelectPlaceholder);

  shipData[shipClass].forEach(ship => {
    const option = document.createElement('option');
    option.value = ship.name;
    option.textContent = ship.name;
    shipSelect.appendChild(option);
  });

  updateUI();
}

function updateUI() {
  const shipClass = document.getElementById('ship-class').value;
  const shipName = document.getElementById('ship-name').value;
  if (!shipClass || !shipName) {
    document.getElementById('ship-image').src = '/Resources/STEEL.png';
    hideAllTitlesAndButtons();
    clearDropdowns();
    return;
  }

  const ship = shipData[shipClass].find(s => s.name === shipName);
  if (!ship) {
    document.getElementById('ship-image').src = '/Resources/STEEL.png';
    hideAllTitlesAndButtons();
    clearDropdowns();
    return;
  }

  document.getElementById('ship-image').src = `/Resources/Ships/${shipClass}/${shipName}.webp`;

  createDropdowns('turret-slots', turretTypes, ship.turrets);
  document.querySelector('button[onclick="applyFirstTurretToAll()"]').style.display = ship.turrets > 1 ? 'inline-block' : 'none';

  const medSection = document.getElementById('medium-turret-section');
  const medContainer = document.getElementById('medium-turret-slot');
  if (ship.medium && ship.medium > 0) {
    medSection.style.display = 'block';
    createDropdowns('medium-turret-slot', mediumTurretTypes, ship.medium);
  } else {
    medSection.style.display = 'none';
    medContainer.innerHTML = '';
  }

  createDropdowns('rig-WEP', rigTypes.WEP, ship.wep);
  createDropdowns('rig-DEF', rigTypes.DEF, ship.def);
  createDropdowns('rig-ENG', rigTypes.ENG, ship.eng);
  createDropdowns('rig-RCT', rigTypes.RCT, ship.rct);

  createDropdowns('subsystem-slots', subsystemTypes, ship.subsystems);

  document.getElementById('rig-title-WEP').style.display = ship.wep > 0 ? 'block' : 'none';
  document.getElementById('rig-title-DEF').style.display = ship.def > 0 ? 'block' : 'none';
  document.getElementById('rig-title-ENG').style.display = ship.eng > 0 ? 'block' : 'none';
  document.getElementById('rig-title-RCT').style.display = ship.rct > 0 ? 'block' : 'none';

  const turretHeaders = [...document.querySelectorAll('h3')].filter(h3 => h3.textContent === 'Turrets');
  turretHeaders.forEach(h => (h.style.display = 'block'));
  const subsysHeaders = [...document.querySelectorAll('h3')].filter(h3 => h3.textContent === 'Subsystems');
  subsysHeaders.forEach(h => (h.style.display = 'block'));
}

function createDropdowns(containerId, options, count) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const select = document.createElement('select');

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '-';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    select.appendChild(placeholderOption);

    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });

    container.appendChild(select);
  }
}

function clearDropdowns() {
  ['turret-slots', 'medium-turret-slot', 'rig-WEP', 'rig-DEF', 'rig-ENG', 'rig-RCT', 'subsystem-slots'].forEach(id => {
    const container = document.getElementById(id);
    if (container) container.innerHTML = '';
  });
  document.querySelector('button[onclick="applyFirstTurretToAll()"]').style.display = 'none';
  document.getElementById('medium-turret-section').style.display = 'none';
}

function applyFirstTurretToAll() {
  const container = document.getElementById('turret-slots');
  if (container.children.length === 0) return;
  const firstSelect = container.children[0];
  const selectedValue = firstSelect.value;
  if (!selectedValue) return;

  for (let i = 1; i < container.children.length; i++) {
    container.children[i].value = selectedValue;
  }
}

function exportBuild() {
  const shipClass = document.getElementById('ship-class').value;
  const shipName = document.getElementById('ship-name').value;
  if (!shipClass || !shipName) {
    alert('Please select a ship class and ship first.');
    return;
  }
  const build = {
    shipClass,
    shipName,
    turrets: getSelectedValues('turret-slots'),
    mediumTurrets: getSelectedValues('medium-turret-slot'),
    rigs: {
      WEP: getSelectedValues('rig-WEP'),
      DEF: getSelectedValues('rig-DEF'),
      ENG: getSelectedValues('rig-ENG'),
      RCT: getSelectedValues('rig-RCT')
    },
    subsystems: getSelectedValues('subsystem-slots')
  };

  const jsonStr = JSON.stringify(build);
  const encoded = btoa(jsonStr);
  document.getElementById('export-import-box').value = encoded;
}

function getSelectedValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return Array.from(container.children)
    .map(select => select.value)
    .filter(v => v !== '' && v !== null);
}

function importBuild() {
  const text = document.getElementById('export-import-box').value.trim();
  if (!text) {
    alert('Please paste build data to import.');
    return;
  }
  let jsonStr;
  try {
    jsonStr = atob(text);
  } catch {
    alert('Invalid build data.');
    return;
  }
  let build;
  try {
    build = JSON.parse(jsonStr);
  } catch {
    alert('Build data corrupted or invalid JSON.');
    return;
  }

  if (!build.shipClass || !build.shipName || !shipData[build.shipClass]) {
    alert('Ship class or ship name invalid.');
    return;
  }

  const shipList = shipData[build.shipClass];
  if (!shipList.find(s => s.name === build.shipName)) {
    alert('Ship name not found in selected class.');
    return;
  }

  document.getElementById('ship-class').value = build.shipClass;
  updateShipList();
  document.getElementById('ship-name').value = build.shipName;
  updateUI();

  setSelectedValues('turret-slots', build.turrets || []);
  setSelectedValues('medium-turret-slot', build.mediumTurrets || []);

  setSelectedValues('rig-WEP', build.rigs?.WEP || []);
  setSelectedValues('rig-DEF', build.rigs?.DEF || []);
  setSelectedValues('rig-ENG', build.rigs?.ENG || []);
  setSelectedValues('rig-RCT', build.rigs?.RCT || []);

  setSelectedValues('subsystem-slots', build.subsystems || []);
}

function setSelectedValues(containerId, values) {
  const container = document.getElementById(containerId);
  if (!container) return;
  Array.from(container.children).forEach((select, i) => {
    if (i < values.length && values[i]) {
      select.value = values[i];
    } else {
      select.value = '';
    }
  });
}

fetchData();