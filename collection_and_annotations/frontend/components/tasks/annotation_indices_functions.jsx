
import React from "react";

const odd_indices = turns => Array.from({length: turns.length}, (_, i) => i).filter(idx => idx % 2 === 1 && idx < turns.length);
const even_indices = turns => Array.from({length: turns.length}, (_, i) => i).filter(idx => idx % 2 === 0 && idx < turns.length);
const all_indices = turns => Array.from({length: turns.length}, (_, i) => i).filter(idx => idx < turns.length);
const all_indices_skip_first = turns => Array.from({length: turns.length}, (_, i) => i).filter(idx => idx > 0 && idx < turns.length);
const no_indices = turns => [];

const index_functions = new Map([
    ["odd", odd_indices],
    ["even", even_indices],
    ["all", all_indices],
    ["all_skip_first", all_indices_skip_first],
    ["no_indices", no_indices]
])

export { index_functions };