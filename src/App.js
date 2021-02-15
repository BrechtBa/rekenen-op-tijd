import './App.css';
import React, { useState, useEffect, useRef } from "react";


function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * Math.floor(max-min+1));
}


function getAddition(settings) {
  const min = settings.min;
  const max = settings.max;

  const answer = getRandomInt(min, max);
  const a = getRandomInt(0, answer);
  const b = answer - a;
  return {a: a, b: b, operator: '+', answer: answer}
}


function getSubtraction(settings) {
  const min = settings.min;
  const max = settings.max;

  const answer = getRandomInt(min, max);
  const a = getRandomInt(answer, max);
  const b = a - answer;
  return {a: a, b: b, operator: '-', answer: answer}
}



function getExercise(settings) {
  let operators = []
  if(settings.addition){
    operators.push(getAddition)
  }
  if(settings.subtraction){
    operators.push(getSubtraction)
  }
  const index = getRandomInt(0, operators.length-1)
  const getter = operators[index]

  return getter(settings)
}

function App() {

  return (
    <div className="App">


      <ExerciseView />
    </div>
  );
}

const fuseSound = new Audio('fuse.mp3')
const explosionSound = new Audio('explosion.mp3')


function ExerciseView(){

  const [settings, setSettings] = useState({min: 0, max: 10, addition: true, subtraction: true, multiplication: false, timeout: 6});
  const [audio, setAudio] = useState(true);
  const [score, setScore] = useState(0);
  const [exercise, setExercise] = useState(null);
  const [timeoutTimer, setTimeoutTimer] = useState(null);
  const [scene, setScene] = useState('scene.png');
  const [startLabel, setStartLabel] = useState('START');
  const [statistics, setStatistics] = useState({velocity: 0, startTime: 0, endTime: null});

  const [view, setView] = useState('settings');


  const playSound = (sound) => {
    if(audio){
      sound.play()
    }
  }
  const stopSound = (sound) => {
    sound.pause();
    sound.currentTime = 0;
  }

  const handleStart = () => {
    setScene('scene.png')
    setScore(0)
    setStatistics({velocity: 0, correct: 0, startTime: new Date().getTime(), endTime: null})
    newExercise()
    setView('exercise')
  }

  const handleSettings = () => {
    setScore(0)
    setStatistics({velocity: 0, correct: 0, startTime: new Date().getTime(), endTime: null})
    setView('settings')
  }

  const handleAnswer = (exercise, answer) => {
    // stop the timer
    stopTimer()
    // check the answer
    if(answer == exercise.answer){
      handleCorrectAnswer()
    }
    else{
      handleWrongAnswer()
    }
  }

  const handleCorrectAnswer = () => {
    setScore(score+1)

    const time = new Date().getTime()
    setStatistics({
      velocity: (statistics.correct+1)/(time-statistics.startTime)*1000*60,
      correct: statistics.correct+1,
      startTime: statistics.startTime,
      endTime: time
    })

    newExercise()
  }

  const handleWrongAnswer = () => {
    explode()
  }

  const handleTimeout = () => {
    explode()
  }

  const explode = () => {
    stopSound(fuseSound)
    playSound(explosionSound)
    setStartLabel('RESPAWN')
    setScene('scene_exploded.png')
    setView('respawn')
  }

  const newExercise = () => {
    startTimer()
    setExercise(getExercise(settings))
    stopSound(fuseSound)
    playSound(fuseSound)
  }

  const startTimer = () => {
    setTimeoutTimer(setTimeout(() => {
      clearTimeout(timeoutTimer);
      handleTimeout()
    }, settings.timeout*1000))
  }
  const stopTimer = () => {
    clearTimeout(timeoutTimer);
  }

  const renderSettings = () => {
    if(view === 'settings') {
      return (
        <Settings settings={settings} setSettings={setSettings} handleStart={handleStart}/>
      )
    }
  }

  const renderExercise = () => {
    if(view === 'exercise') {
      return (
        <div>
          <Exercise exercise={exercise} handleAnswer={handleAnswer}/>
          <Timer/>
          <Score score={score}/>
        </div>
      );
    }
  }
  const renderRespawn = () => {
    if(view === 'respawn') {
      return (
        <Respawn handleStart={handleStart} handleSettings={handleSettings} exercise={exercise} statistics={statistics} score={score}/>
      )
    }
  }

  return (
    <div>
      <img src={scene} style={{width: '100%', left: '0px'}} />
      {renderSettings()}
      {renderExercise()}
      {renderRespawn()}
    </div>
  );

}

function Settings(props) {
  const settings = props.settings;
  const setSettings = props.setSettings;

  const handleStart = props.handleStart;

  const handleCheckAddition = () => {
    settings.addition = !settings.addition
    setSettings(settings)
  }
  const handleCheckSubtraction = () => {
    settings.subtraction = !settings.subtraction
    setSettings(settings)
  }
  const handleMinChange = (e) => {
    const tempSettings = JSON.parse(JSON.stringify(settings))
    tempSettings.min = parseInt(e.target.value);
    setSettings(tempSettings)
  }
  const handleMaxChange = (e) => {
    const tempSettings = JSON.parse(JSON.stringify(settings))
    tempSettings.max = parseInt(e.target.value);
    setSettings(tempSettings)
  }
  const handleTimeoutChange = (e) => {
    const tempSettings = JSON.parse(JSON.stringify(settings))
    tempSettings.timeout = parseFloat(e.target.value);
    setSettings(tempSettings)
  }

  return (

    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgb(255, 255, 255, 0.6)', padding: '50px'}}>

      <div style={{margin: '10px'}}>
        <div>
          <div>
            <label style={{fontSize: '20px', marginRight: '20px', width: '150px'}}>Tijd:</label>
            <input style={{width: '100px', fontSize: '20px'}} type="text" value={settings.timeout} onChange={handleTimeoutChange} />
          </div>
        </div>

        <div>
          <div>
            <label style={{fontSize: '20px', marginRight: '20px', width: '150px'}}>Minimum:</label>
            <input style={{width: '100px', fontSize: '20px'}} type="text" value={settings.min} onChange={handleMinChange} />
          </div>
          <div>
            <label style={{fontSize: '20px', marginRight: '20px', width: '150px'}}>Maximum:</label>
            <input style={{width: '100px', fontSize: '20px'}} type="text" value={settings.max} onChange={handleMaxChange} />
          </div>
        </div>

        <div>
          <div>
            <input type="checkbox" id="addition" name="addition" defaultChecked={settings.addition} onChange={handleCheckAddition} style={{width: '25px', height: '25px'}}/>
            <label style={{fontSize: '30px', marginLeft: '20px'}}>+</label>
          </div>
          <div>
            <input type="checkbox" id="subtraction" name="subtraction" defaultChecked={settings.subtraction} onChange={handleCheckSubtraction} style={{width: '25px', height: '25px'}}/>
            <label style={{fontSize: '30px', marginLeft: '20px'}}>-</label>
          </div>
        </div>
      </div>

      <button type="button" style={{width: '500px', height: '50px', fontSize: '30px', background: '#737373', marginTop: '20px'}} onClick={(e) => handleStart()}>
        <span style={{color: '#eeeeee', textShadow: '3px 3px rgb(0, 0, 0, 0.8)'}}>START</span>
      </button>
    </div>
  )
}


function Respawn(props) {
  const handleStart = props.handleStart;
  const handleSettings = props.handleSettings;
  const score = props.score;
  const exercise = props.exercise;
  const statistics = props.statistics;

  const formatExercise = (exercise) => {
    if(exercise !== null){
      return `${exercise.a} ${exercise.operator} ${exercise.b} = `
    }
    return '';
  }

  return (
    <div style={{position: 'absolute', top: '0px', width: '100%', height: '100%', background: 'rgb(50, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <div>

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '60px'}}>
          <div style={{fontSize: '80px', color: '#ffffff', textShadow: '6px 6px rgb(0, 0, 0, 0.8)'}}>You died!</div>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '10px'}}>
          <div style={{fontSize: '40px', color: '#ffffff', textShadow: '3px 3px rgb(0, 0, 0, 0.8)'}}>
            Score: <span style={{fontSize: '40px', color: '#fdff54'}}>{score}</span>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '10px'}}>
          <div style={{height: '40px'}}>
            <Achievements score={score} />
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '10px'}}>
          <div style={{fontSize: '30px', color: '#ffffff', textShadow: '3px 3px rgb(0, 0, 0, 0.8)'}}>
            {formatExercise(exercise)}
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginBottom: '50px'}}>
          <div style={{fontSize: '20px', color: '#ffffff', textShadow: '3px 3px rgb(0, 0, 0, 0.8)'}}>
            <span style={{color: '#fdff54'}}>{Math.round(statistics.velocity*10)/10}</span> juiste antwoorden per minuut.
          </div>
        </div>

        <div>
          <button type="button" style={{width: '500px', height: '50px', fontSize: '30px', background: '#737373', marginTop: '20px'}} onClick={(e) => handleStart()}>
            <span style={{color: '#eeeeee', textShadow: '3px 3px rgb(0, 0, 0, 0.8)'}}>Respawn</span>
          </button>
        </div>
        <div>
          <button type="button" style={{width: '500px', height: '50px', fontSize: '30px', background: '#737373', marginTop: '20px'}} onClick={(e) => handleSettings()}>
            <span style={{color: '#eeeeee', textShadow: '3px 3px rgb(0, 0, 0, 0.8)'}}>Title screen</span>
          </button>
        </div>
      </div>
    </div>
  )

}


function Exercise(props) {
  const exercise = props.exercise
  const handleAnswer = props.handleAnswer;

  const [answer, setAnswer] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  });

  const handleKeyDown = (e) => {
    if(e.key === 'Enter') {
      handleAnswer(exercise, parseFloat(answer))
      setAnswer('')
    }
  }

  const formatExercise = (exercise) => {
    if(exercise !== null){
      return `${exercise.a} ${exercise.operator} ${exercise.b} = `
    }
    return '';
  }

  return (
    <div>
      <div style={{position: 'absolute', top: '42%', left: '50%', transform: 'translate(-40%, -50%)', fontSize: '60px', fontFamily: 'sans-serif'}}>
        {formatExercise(exercise)}
      </div>
      <input ref={inputRef} style={{position: 'absolute', top: '65%', left: '55%', width: '200px', height: '100px', background: 'rgb(255, 255, 255, 0.6)', fontSize: '60px', textAlign: 'center'}} type="number" value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}/>
    </div>
  )
}


function Timer(props){
  const [src, setSrc] = useState('tnt.png');


  const flashTime = 500;

  const f1 = () => {
    setSrc('tnt.png')
    const timer = setTimeout(() => f2(), flashTime);
    return () => clearTimeout(timer);
  }
  const f2 = () => {
    setSrc('tnt_flash.png')
    const timer = setTimeout(() => f1(), flashTime);
    return () => clearTimeout(timer);
  }

  useEffect(() => {
    f1()
  },[]);

  return (
    <div>
      <img src={src} style={{position: 'absolute', width: '18%', left: '25%', top: '55%'}} />
    </div>
  )
}


function Score(props){

  const score = props.score;

  return (
    <div style={{position: 'absolute', right: '20%', top: '60px', background: 'rgb(255, 255, 255, 0.3)', padding: '10px'}}>
      <div style={{display: 'flex'}}>
        <div style={{width: '100px', fontSize: '30px'}}>Score: </div>
        <div style={{width: '100px', fontSize: '40px', textAlign: 'right'}}>{score}</div>
      </div>
      <div style={{height: '38px'}}>
        <Achievements score={score} />
      </div>
    </div>
  )
}

function Achievements(props) {
  const score = props.score;
  const availableAchievements = [{
    src: 'Iron_Ingot_JE3_BE2.png',
    score: 5
  }, {
    src: 'Gold_Ingot_JE4_BE2.png',
    score: 10
  }, {
    src: 'Emerald_JE3_BE3.png',
    score: 15
  }, {
    src: 'Diamond_JE3_BE3.png',
    score: 20
  }]
  const achievements = availableAchievements.filter(x => score >= x.score)
  console.log(achievements)
  return (
    <div style={{height: '100%'}}>
      {
        achievements.map((a, index) => {
          return <img key={index} style={{height: '100%', margin: '4px'}} src={a.src}/>
        })
      }
    </div>
  )
}

export default App;
