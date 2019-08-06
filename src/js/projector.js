import React, {useCallback,useRef,useState, useEffect} from 'react';
import {FontAwesomeIcon as FA} from "@fortawesome/react-fontawesome";

const Projector = ({movies, suffix=".svg", paused, fps=7}) =>{
    /*
     * STATES
     */
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
     * SVG Layers
     */
    //const [background, setBackground] = useState([]);
//    const [frames, setFrames] = useState([]);
    const [foreground, setForeground] = useState([]);
    const [logo, setLogo] = useState([]);

    /*
     * NON-STATES
     * consts state/prop dependents or refs 
     */ 
    const time_per_frame = 1000/fps;
    const last_update = useRef(null);
    const anim_id = useRef(null);
    const frames_ref = useRef([]);
    const static_ref = useRef([]);
    /*
     * Methods and Callbacks
     */

    const showFrame = useCallback((mov, frame) => {
        if(!loading){
            frames_ref.current[mov][frame].classList.add('shown');
            Object.values(static_ref.current[mov]).forEach(img => img.classList.add("shown"));
        }
    }, [loading]);

    useEffect( ()=> {
        if(!loading) showFrame(0,0);
    }, [showFrame, loading]);

    const updateFrame = useCallback(
        ()=> { console.log( "trocou frame!"); }
        ,[]);
    
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

    
    useEffect( ()=> { // SET LAYERS
        // setBackground(
        //     movies.map( (mov, idx) => createImg('background',idx,mov))
        // );
        // setForeground(
            
        // );
        // setLogo(
            
        // );

        // setFrames(
        //     movies.map( (mov,idx) => 
        //                 Array(mov.number_frames).fill()
        //                 .map( (_,i) =>
        //                       <img
        //                         key={i}
        //                         src={mov.frames + '/' + i + suffix}
        //                         className='pic'
        //                         id={`frame_${mov.frames}_${i}`}
        //                         onLoad={()=> handleLoad(idx,i)}
        //                         alt={`Frame número ${i+1} do filme ${idx+1}`}
        //                       />)
        //               )
        // );
    }, [movies, suffix, createImg, handleLoad]);

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
          {
              movies.map( (mov,idx) =>
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
                        )
          }
          {movies.map( (mov, idx) => createImg('foreground',idx,mov))}
          {movies.map( (mov, idx) => createImg('logo',idx,mov))}
        </div>
    );
};

export default Projector;
