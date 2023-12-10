// RadiusControl.js

import React from 'react';

function RadiusControl({ radius, onIncrement, onDecrement }) {
  return (
    <div className="radius-control">
      <button onClick={onDecrement}>-</button>
      <span>{radius}</span>
      <button onClick={onIncrement}>+</button>
    </div>
  );
}

export default RadiusControl;
