require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/dbConn');
const statesData = require('../models/statesData.json');
const State = require('../models/States');

connectDB();


const findStateByCode = (code) => {
  return statesData.find(state => state.code.toUpperCase() === code.toUpperCase());
};




// Add functions to handle each route here
exports.getStateData = async (req, res) => {
  const contig = req.query.contig;
  const stateParam = req.params.state;

  if (stateParam) {
    const stateData = findStateByCode(stateParam);

    if (!stateData) {
      return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    const fullPath = req.baseUrl + req.path;
    if (fullPath === `/states/${stateParam}/funfact`) {
      const funFact = await getRandomFunFact(req, res);
      if (!funFact) {
        return res.status(404).json({ error: 'Fun fact not found' });
      }
      return res.json({ state: stateData.state, fun_fact: funFact });
    }

    // Fetch fun facts for the state and add them to the stateData object
    const funFactsResponse = await this.getFunFacts(req);
    if (!funFactsResponse.status) {
      stateData.funfacts = funFactsResponse;
    }

    switch (fullPath) {
      case `/states/${stateParam}/capital`:
        return res.json({ state: stateData.state, capital: stateData.capital_city });
      case `/states/${stateParam}/nickname`:
        return res.json({ state: stateData.state, nickname: stateData.nickname });
      case `/states/${stateParam}/population`:
        const formattedPopulation = stateData.population.toLocaleString();
        return res.json({ state: stateData.state, population: formattedPopulation });
      case `/states/${stateParam}/admission`:
        return res.json({ state: stateData.state, admitted: stateData.admission_date });
      default:
        return res.json(stateData);
    }
  }

  if (contig !== undefined) {
    const contigStates = statesData.filter((state) => {
      return contig.toLowerCase() === 'true' ? state.code !== 'AK' && state.code !== 'HI' : state.code === 'AK' || state.code === 'HI';
    });
    return res.json(contigStates);
  }

  res.json(statesData);
};




exports.getFunFacts = async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const stateData = await findStateByCode(stateCode);

  if (!stateData) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }

  const state = await State.findOne({ stateCode });

  if (!state || !state.funfacts || state.funfacts.length === 0) {
    return { message: `No Fun Facts found for ${stateData.state}`, status: 404 };
  }

  return state.funfacts;
};

exports.getRandomFunFact = async (req, res) => {
  let all_state_fun_facts = await this.getFunFacts(req, res);

  if (all_state_fun_facts.status === 404) {
    return res.status(404).json(all_state_fun_facts);
  }

  const randomIndex = Math.floor(Math.random() * all_state_fun_facts.length);
  res.json({ funfact: all_state_fun_facts[randomIndex] });
};





exports.postFunFacts = async (req, res) => {
  const stateCode = req.params.state;
  const stateData = findStateByCode(stateCode);

  if (!stateData) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }

  const funFacts = req.body.funfacts;

  if (!funFacts) {
    return res.status(400).json({ message: 'State fun facts value required' });
  }

  if (!Array.isArray(funFacts)) {
    return res.status(400).json({ message: 'State fun facts value must be an array' });
  }

  if (funFacts.length === 0) {
    return res.status(400).json({ error: 'Invalid fun facts provided' });
  }

  const result = await State.findOneAndUpdate(
    { stateCode },
    { $push: { funfacts: { $each: funFacts } } },
    { new: true, upsert: true }
  );

  res.json(result);
};


exports.patchFunFact = async (req, res) => {
  const stateCode = req.params.state;
  const stateData = findStateByCode(stateCode);

  if (!stateData) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }

  const { index, funfact } = req.body;

  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }

  if (!funfact) {
    return res.status(400).json({ message: 'State fun fact value required' });
  }

  let state = await State.findOne({ stateCode });

  if (!state) {
    const newState = new State({ stateCode, funfacts: [] });
    await newState.save();
    state = newState;
  }

  if (!state.funfacts || state.funfacts.length === 0) {
    return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
  }

  const adjustedIndex = index - 1;

  if (adjustedIndex >= 0 && adjustedIndex < state.funfacts.length) {
    state.funfacts[adjustedIndex] = funfact;
    await state.save();
    res.json(state);
  } else {
    res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
  }
};





exports.deleteFunFact = async (req, res) => {
  const stateCode = req.params.state;
  const stateData = findStateByCode(stateCode);

  if (!stateData) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }

  const index = req.body.index;

  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }

  const state = await State.findOne({ stateCode });

  if (!state) {
    return res.status(404).json({ message: 'No Fun Facts found for ' + stateData.state });
  }

  const adjustedIndex = index - 1;

  if (adjustedIndex >= 0 && adjustedIndex < state.funfacts.length) {
    state.funfacts.splice(adjustedIndex, 1);
    await state.save();
    res.json(state);
  } else if (state.funfacts.length === 0) {
    res.status(404).json({ message: 'No Fun Facts found for ' + stateData.state });
  } else {
    res.status(404).json({ message: 'No Fun Fact found at that index for ' + stateData.state });
  }
};
