const turretTypes = ['Beam', 'Cannon', 'Flak', 'Coilgun', 'Railgun', 'Ion', 'Shrapnel', 'Blaster'];

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
  Object.keys(shipData).forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls;
    opt.textContent = cls;
    classSelect.appendChild(opt);
  });

  updateShipList();
}

function updateShipList() {
  const shipClass = document.getElementById('ship-class').value;
  const shipSelect = document.getElementById('ship-name');
  shipSelect.innerHTML = '';

  if (!shipData[shipClass]) return;

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
  const ship = shipData[shipClass].find(s => s.name === shipName);
  if (!ship) return;

  document.getElementById('ship-image').src = `/Resources/Ships/${shipClass}/${shipName}.webp`;

  createSelects('turret-slots', turretTypes, ship.turrets);

  const mediumSection = document.getElementById('medium-turret-section');
  if (ship.medium > 0) {
    mediumSection.style.display = 'block';
    createSelects('medium-turret-slot', turretTypes, ship.medium);
  } else {
    mediumSection.style.display = 'none';
  }

  ['WEP', 'DEF', 'ENG', 'RCT'].forEach(type => {
    const container = document.getElementById(`rig-${type}`);
    const title = document.getElementById(`rig-title-${type}`);
    const count = ship[type.toLowerCase()];
    if (count > 0) {
      title.style.display = 'block';
      createSelects(`rig-${type}`, rigTypes[type], count);
    } else {
      title.style.display = 'none';
      container.innerHTML = '';
    }
  });

  createSelects('subsystem-slots', subsystemTypes, ship.subsystems);
}

function createSelects(containerId, options, count) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const select = document.createElement('select');

    const emptyOption = document.createElement('option');
    emptyOption.value = '-';
    emptyOption.textContent = '-';
    select.appendChild(emptyOption);

    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });

    container.appendChild(select);
  }
}

function exportBuild() {
  const shipClass = document.getElementById('ship-class').value;
  const shipName = document.getElementById('ship-name').value;

  const collectValues = parentId =>
    Array.from(document.getElementById(parentId).querySelectorAll('select')).map(s => s.value);

  const data = {
    shipClass,
    shipName,
    turrets: collectValues('turret-slots'),
    mediumTurrets: collectValues('medium-turret-slot'),
    WEP: collectValues('rig-WEP'),
    DEF: collectValues('rig-DEF'),
    ENG: collectValues('rig-ENG'),
    RCT: collectValues('rig-RCT'),
    subsystems: collectValues('subsystem-slots')
  };

  const encoded = btoa(JSON.stringify(data));
  document.getElementById('export-import-box').value = encoded;
}

function importBuild() {
  try {
    const input = document.getElementById('export-import-box').value.trim();
    const data = JSON.parse(atob(input));

    document.getElementById('ship-class').value = data.shipClass;
    updateShipList();

    setTimeout(() => {
      document.getElementById('ship-name').value = data.shipName;
      updateUI();

      const applyValues = (parentId, values) => {
        const selects = document.getElementById(parentId).querySelectorAll('select');
        selects.forEach((s, i) => {
          if (values[i]) s.value = values[i];
        });
      };

      applyValues('turret-slots', data.turrets);
      applyValues('medium-turret-slot', data.mediumTurrets);
      applyValues('rig-WEP', data.WEP);
      applyValues('rig-DEF', data.DEF);
      applyValues('rig-ENG', data.ENG);
      applyValues('rig-RCT', data.RCT);
      applyValues('subsystem-slots', data.subsystems);
    }, 50);
  } catch (e) {
    alert('Invalid import code!');
  }
}

window.onload = fetchData;