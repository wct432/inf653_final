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
      return res.status(404).json({ error: 'State not found' });
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
        return res.json({ state: stateData.state, population: stateData.population });
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




exports.getFunFacts = async (req) => {
  const stateCode = req.params.state.toUpperCase();
  const stateData = await findStateByCode(stateCode);

  if (!stateData) {
    return { error: 'State not found', status: 404 };
  }

  const state = await State.findOne({ stateCode });

  if (!state || !state.funfacts || state.funfacts.length === 0) {
    return { message: 'No fun facts found for this state', status: 404 };
  }

  return state.funfacts;
};

exports.getRandomFunFact = async (req, res) => {
  let all_state_fun_facts = await this.getFunFacts(req);

  if (all_state_fun_facts.status === 404) {
    return res.status(404).json(all_state_fun_facts);
  }

  const randomIndex = Math.floor(Math.random() * all_state_fun_facts.length);
  res.json(all_state_fun_facts[randomIndex]);
};





exports.postFunFacts = async (req, res) => {
  const stateCode = req.params.state;
  const stateData = findStateByCode(stateCode);

  if (!stateData) {
    return res.status(404).json({ error: 'State not found' });
  }

  const funFacts = req.body.funfacts;

  if (!Array.isArray(funFacts) || funFacts.length === 0) {
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
    return res.status(404).json({ error: 'State not found' });
  }

  const { index, funfact } = req.body;

  if (!index || !funfact) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  const state = await State.findOne({ stateCode });

  if (!state) {
    return res.status(404).json({ error: 'Fun facts not found' });
  }

  const adjustedIndex = index - 1;

  if (adjustedIndex >= 0 && adjustedIndex < state.funfacts.length) {
    state.funfacts[adjustedIndex] = funfact;
    await state.save();
    res.json(state);
  } else {
    res.status(400).json({ error: 'Invalid fun fact index' });
  }
};

exports.deleteFunFact = async (req, res) => {
  const stateCode = req.params.state;
  const stateData = findStateByCode(stateCode);

  if (!stateData) {
    return res.status(404).json({ error: 'State not found' });
  }

  const index = req.body.index;

  if (!index) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  const state = await State.findOne({ stateCode });

  if (!state) {
    return res.status(404).json({ error: 'Fun facts not found' });
  }

  const adjustedIndex = index - 1;

  if (adjustedIndex >= 0 && adjustedIndex < state.funfacts.length) {
    state.funfacts.splice(adjustedIndex, 1);
    await state.save();
    res.json(state);
  } else {
    res.status(400).json({ error: 'Invalid fun fact index' });
  }
};

