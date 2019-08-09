import React, {useEffect, useState, useCallback} from 'react';
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";
import Projector from './projector';

const Player = ({ pause_between_anims, movies }) => {
    /*
     * STATES
     */
    const [movie_id, setMovieId] = useState(0);
   // const prev_movie_id = usePrevious(movie_id);
    const [repeat, setRepeat] = useState(true);
    const [type, setType] = useState('projector'); // projector, anim_slider, slider
    const [paused, setPaused] = useState(false);

    /*
     * NON-STATES
     */
    const number_of_movies = movies.length;
    const movie = movies[movie_id];

    /*
     * METHODS
     */
    const nextMovie = useCallback(() => {
        setMovieId( (movie_id+1)%movies.length );
    }, [movies, movie_id]);
    
    /*
     * EFFECTS
     */
    useEffect( ()=>{
        // define type: 'projector', 'anim_slider' or 'slider'
        let state = type;
        if(pause_between_anims) state = 'anim_slider';
        else state = 'projector';
        if(movies
           .reduce( (acc,{number_frames}) => acc && (number_frames===1)
                    ,true))
            state = 'slider';
        setType(state);
    }, [pause_between_anims, movies, type]);

    /*
     * BUTTONS
     */

    const movie_counter =  (<div id="slide_counter" aria-current
                         title={`Animação ${movie_id+1} de ${number_of_movies}`}
                         className="secondary frameless">
                      {movie_id+1} / {number_of_movies}
                    </div>
                           );

    const repeat_button = !(type === 'anim_slider')
          ? null
          : (<button
               // TODO: devo usar esse this.state.repeat_button?
              disabled={movie.number_frames ===1  }
              //Click={this.updateTimeStamp}
              title="Repetir animação"
            >
              <FA
                icon="redo-alt"
                flip="horizontal"
              />
             </button>);

    const repeat_movie =  (
        <button
          style={ type === "projector" ? {} : {visibility: 'hidden'} }
          className="secondary"
          onClick={() => setRepeat( !repeat )}
          title="Repetir animação"
          //aria-pressed={this.state.repeat}
        >
          <span className='fa-layers fa-fw'>
            <FA icon="sync-alt"/>
            {!repeat
             ? null
             : (
                <>
                  <FA
                    transform="up-9 right-9"
                    icon="circle"
                    className='blue'
                  />
                  <FA
                    transform="shrink-6 up-9 right-9"
                    icon="check"
                  />
                </>
            )}
          </span>
        </button>);

    const play = type !== 'projector'
          ? null
          : (
            <button
              onClick={()=>setPaused( !paused )}
              title={`${paused ? "Reproduzir" : "Pausar"} animação`}
              className={paused ? "play" : ''}
            >
              <FA icon={paused ? "play" : "pause"}/>
            </button>
        );

 const next = number_of_movies > 1
              ? (<button
                   className="right"
                   onClick={nextMovie}
                   title="Avançar animação"
                   disabled={
                       (number_of_movies=== movie_id + 1)

                   }>
                   <FA
                     icon={type==='projector' ? "forward" :"step-forward"}
                   />
                 </button>)
       : null;

    const backward = number_of_movies > 1
          ? (<button
               // TODO: ??? this.anim_slider && this.state.movie_id===0 ? true : false
                   disabled={type !== 'projector' && movie_id===0 }
                   title="Voltar animação"
                   className="left"
             //onClick={this.anim_slider ? this.prevMovie :this.updateTimeStamp}
             >
             <FA icon={type === 'projector' ?  "backward" : "step-backward"}/>
                  </button>)
          : null;
    
    return (
        <div className='player'>
          <div className='screen'>
            <Projector
              movies={movies}
              paused={paused}
              movie_id={movie_id}
 //             prev_movie_id={prev_movie_id}
              setMovieId={setMovieId}
              type={type}
            />
          </div>
          <div className='controller'>
            {movie_counter}
            {backward}{repeat_button} {play}{next}
            {repeat_movie}
          </div>
        </div>
    );
};

export default Player;
