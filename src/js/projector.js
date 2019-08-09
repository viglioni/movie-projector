import React, {useCallback,useRef,useState, useEffect} from 'react';
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";

const Projector = ({movies, paused, movie_id, prev_movie_id=0, nextMovie, type}) =>{
    /*
     * STATES
     */
    const [times_played, setTimesPlayed] = useState(0);
    const [loading, setLoading] = useState(true);
    const [percentage, setPercentage] = useState(0);
    const [frames_loaded, setFramesLoaded] = useState(
        movies.map( mov => Array(mov.number_frames).fill(false))
    );
    const [static_loaded, setStaticLoaded] = useState(
        movies.map( mov => ({
            background: !mov.background,
            foreground: !mov.foreground,
            logo:!mov.logo,
        }))  
    );

    /*
     * NON-STATES
     * consts state/prop dependents 
     */
    const movie = movies[movie_id];
    const fps = movie.fps || 13;
    const suffix = movie.suffix || ".svg";
    const time_per_frame = 1000/fps;
    const times_to_play = movie.times || 1;
    /*
     * REFS 
     */
    const last_update = useRef(null);
    const anim_id = useRef(null);
    const frames_ref = useRef([]);
    const static_ref = useRef([]);
    const frame_id = useRef(0);
    
    /*
     * Methods and Callbacks
     */
    const showFrame = useCallback(() => {
        if(!loading){
            frames_ref.current[movie_id][frame_id.current].classList.add('shown');
            Object.values(static_ref.current[movie_id]).forEach(img => img.classList.add("static_shown"));
        }
    }, [movie_id, loading]);

    const hideFrame = useCallback( () => {
        frames_ref.current[movie_id][frame_id.current].classList.remove('shown');
    },[movie_id]);

    useEffect( ()=> console.log('paused: ', paused), [paused]);
    
    const updateFrame = useCallback( ()=> {
        
        hideFrame();
        frame_id.current = (frame_id.current + 1)%movie.number_frames;
        
        if(frame_id.current === 0){ setTimesPlayed ( times => times + 1); }
        showFrame();
        //        console.log("Frame is: ", frame_id.current, " from movie ", movie_id);
        
    },[movie, hideFrame, showFrame]);
    
    const step = useCallback (
        (start_time, last_animation_request) =>{          
            if(!loading){
                let checkpoint = last_update.current || start_time;
                let delta = start_time - checkpoint;
                if (delta > time_per_frame){
                    checkpoint = start_time;
                    if(!paused) updateFrame();
                }
                last_update.current = checkpoint;
            }
            if(paused && anim_id.current) {
                window.cancelAnimationFrame(anim_id.current);
                anim_id.current = null;
            } else {
                anim_id.current = window.requestAnimationFrame(step);
            }
        }
        ,[last_update, time_per_frame, updateFrame, loading, paused]);

    const handleLoad = useCallback(
        (mov_idx,img_key) => {
            setStaticLoaded(
                static_loaded => {
                    const new_static = [...static_loaded];
                    if( isNaN(img_key) ){
                        new_static[mov_idx][img_key] = true;
                    }
                    return new_static;
                }
            );
            setFramesLoaded(
                frames_loaded => {
                    const new_frames = [...frames_loaded];
                    if( !isNaN(img_key) ) {
                         new_frames[mov_idx][img_key] = true;
                    }
                    return new_frames;
                }
            );
        }
        ,[]);
    
    const createImg = useCallback(
        (type, idx, mov) =>
            mov[type]
            ? <img
                key={type + "_" + idx}
                src={mov[type] + suffix}
                className='pic'
                id={type + "_" + idx}
                onLoad={()=> handleLoad(idx, type)}
                alt={`${type} do filme ${idx+1}`}
                ref={(el) => {
                    if(!static_ref.current[idx])
                        static_ref.current[idx] = {};
                    static_ref.current[idx][type] = el;
                }}
              />
        : null
        ,[handleLoad, suffix]);



    /*
     * Effects
     */

    useEffect( ()=>{
        console.log(movie_id, prev_movie_id);
    }, [movie_id, prev_movie_id]);

    useEffect( ()=> { // show first frame
        if(!loading) showFrame();
    }, [showFrame, loading]);

    useEffect( ()=>{ // SET IF PAGE IS LOADING
        setLoading( 
            !(  frames_loaded.map( x => x.reduce( (acc,val) => acc && val, true))
                 .reduce( (acc,val) => acc && val, true) 
              && static_loaded.map ( x => Object.values(x).reduce( (acc,val) => acc && val, true))
              .reduce( (acc,val) => acc && val, true)  )
        );

        setPercentage(
            Math.floor(
                100*(frames_loaded
                     .reduce( (sum, mov) => sum + mov.filter(el=>el).length, 0)/
                     ( frames_loaded
                       .reduce( (sum, mov) => sum + mov.length, 0))
                    )
            ));
        
    }, [static_loaded, frames_loaded]);

    
    useEffect( ()=> { // SET LOADING STATES OF FRAMES AND STATIC IMGS
        setFramesLoaded(
            movies.map( mov => Array(mov.number_frames).fill(false))
        );
        setStaticLoaded(
            movies.map( mov => ({
                background: !mov.background,
                foreground: !mov.foreground,
                logo:!mov.logo,
            }))  
        );
    },[movies]);

    useEffect( ()=>{
        const animation = window.requestAnimationFrame( step );
        return () => window.cancelAnimationFrame(animation);
    },[step]);


    /*
     * RETURN
     */

    return (
        <div className='projector'>
          <div className={loading ? "loading" : "hide" }>
            <FA icon="circle-notch" spin/>
            <p> {percentage} %</p>
          </div>
          {movies.map( (mov, idx) => createImg('background',idx,mov))}
          {movies.map( (mov,idx) =>
                          Array(mov.number_frames).fill()
                          .map( (_,i) =>
                                <img
                                  key={i}
                                  src={mov.frames + '/' + i + suffix}
                                  className='pic'
                                  id={`frame_${idx}_${i}`}
                                  onLoad={()=> handleLoad(idx,i)}
                                  alt={`Frame número ${i+1} do filme ${idx+1}`}
                                  ref={(el) => {
                                      if(!frames_ref.current[idx])
                                          frames_ref.current[idx] = [];
                                      frames_ref.current[idx][i] = el;
                                  }}
                                />)
                        )}
          {movies.map( (mov, idx) => createImg('foreground',idx,mov))}
          {movies.map( (mov, idx) => createImg('logo',idx,mov))}
        </div>
    );
};

export default Projector;
