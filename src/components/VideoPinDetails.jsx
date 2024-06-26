import { Alert, Avatar, Box, Button, Divider, Paper, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CameraIndoorIcon from '@mui/icons-material/CameraIndoor';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteVideo, gertUserInfo, getSpecificVideo, recommendedFeed } from '../utils/fetchData';
import { getFirestore } from 'firebase/firestore';
import firebaseapp from '../firebase-config';
import Spinner from './Spinner';
import ReactPlayer from 'react-player'
import moment from 'moment';
import parse from 'html-react-parser';
import { fetchUser } from '../utils/fetchUser';
import RecommendedVideo from './RecommendedVideo';

const avatar ="https://ak.picdn.net/contributors/3038285/avatars/thumb.jpg?t=164360626";

const VideoPinDetails = () => {
    const db = getFirestore(firebaseapp);
    const {videoId}=useParams()
    const navigate = useNavigate();
    const [localUser] = fetchUser();

    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [videoInfo, setVideoInfo] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [feeds, setFeeds] = useState(null);

    const handleClickOpen = () => {
        setOpen(true);
    };
    
    const handleClose = () => {
        setOpen(false);
    };
    
    const deleteSpecificVideo=(videoId)=>{
        setIsLoading(true);
        deleteVideo(db,videoId)
        setIsLoading(false);
        navigate("/", { replace: true });
    }


    useEffect(() => {
        if (videoId) {
            setIsLoading(true);
            getSpecificVideo(db, videoId).then((data) => {
                setVideoInfo(data);

                recommendedFeed(db, data.category, videoId).then((feed) => {
                    setFeeds(feed);
                  });

                gertUserInfo(db, data.userId).then((user) => {
                    setUserInfo(user);
                });
                setIsLoading(false);
            });
        }
    }, [videoId]);

    if (isLoading) {
        return (
            <Box
                sx={{
                width:'100%',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                height:'100%',
                }}
            >
                <Spinner msg={"Loading your feeds"} />
            </Box>
        );
    }

    return ( 
        <Box sx={{display:'flex',flexDirection:'row',flexWrap:'wrap'}}>
            <Box sx={{display:'flex',flexDirection:'column',mr:2,flexGrow:3,gap:{xs:1,sm:2,md:3}}}>
                <Box sx={{mt:{xs:1,sm:3,md:5}}}>
                    <Stack
                        direction="row"
                        divider={<Divider orientation="vertical" flexItem />}
                        spacing={2}
                    >
                        <Link to="/">
                            <CameraIndoorIcon/> 
                        </Link>
                        <Typography>{videoInfo?.category}</Typography>
                    </Stack>
                </Box>
                <Box sx={{maxWidth:'640px',width:'100%',display:'flex',flexDirection:'column'}}>
                    <Box sx={{display:'flex',justifyContent:'center',ml:2}}>
                    <ReactPlayer
                        url={`${videoInfo?.videoUrl}`}
                        controls={true}
                        volume={0.2}
                        width='100%'
                        // height={'100%'}
                    />
                    </Box>
                    <Box sx={{display:'flex',flexDirection:'row',justifyContent:'space-between',mx:1,mt:1}}>
                        <Typography sx={{
                            fontSize:'11px',
                            color:'black',
                            ml:2
                        }}>
                            🌍 {videoInfo?.location}
                        </Typography>
                        {
                            videoInfo?.id && (
                                <>
                                    <Typography sx={{
                                        fontSize:'11px',
                                        color:'black',
                                        fontStyle: 'italic'
                                    }}>
                                        {moment(new Date(parseInt(videoInfo.id)).toISOString()).fromNow()}
                                    </Typography>
                                </>
                            )
                        }
                    </Box>

                    <Box sx={{fontWeight:'bold',fontSize:'27px',mt:2,ml:2}}>
                        🎬 {videoInfo?.title} 📽️
                    </Box>
                    <Paper elevation={0} sx={{display:'flex',alignItems:'center',p:1,mt:2,ml:2,bgcolor:'#edf0f7'}}>
                        <Box sx={{display:'flex',width:'100%',justifyContent:'space-between',alignItems:'center'}}>
                            <Link to={`/userDetail/${videoInfo?.userId}`} style={{textDecoration:'none',color:'black',display:'flex',flexDirection:'row',gap:4,alignItems:'center'}}>
                                <Avatar
                                    src={userInfo?.photoURL ? userInfo?.photoURL : avatar}
                                    sx={{ width: 35, height: 35 }}
                                />
                                <Typography sx={{fontSize:'20px',fontWeight:'bold'}}>
                                    {userInfo?.displayName}
                                </Typography>
                            </Link>
                            {
                                userInfo?.uid === localUser.uid && (
                                    <Button onClick={handleClickOpen}>
                                        <DeleteIcon sx={{color:'#fc6c23'}} />
                                    </Button>
                                )
                            }
                        </Box>  
                    </Paper>
                    <Box>
                        {
                            open && (
                                <Alert 
                                    sx={{mt:2,ml:2}}
                                    severity="error"
                                    action={
                                        <>
                                            <Button color="inherit" size="small" onClick={()=>deleteSpecificVideo(videoId)}>
                                                <DoneIcon/>
                                            </Button>
                                            <Button color="inherit" size="small" onClick={handleClose}>
                                                <CloseIcon/>
                                            </Button>
                                        </>
                                    }
                                >
                                    Do you want to Delete this video?
                                </Alert>
                            )
                        }
                    </Box>
                    <Typography sx={{display:'flex',flexDirection:'row',alignItems:'center',fontFamily:'Playfair Display',mt:2,ml:2,fontWeight:'bold',fontSize:'20px'}}>
                        📝 Description
                    </Typography>
                    {
                        videoInfo?.content && (
                            <Box sx={{fontFamily:'Playfair Display',mt:0,ml:2,fontSize:'15px',ml:5}}>
                                {parse(videoInfo.content)}
                            </Box>
                        )
                    }
                    
                </Box>
            </Box>
            <Box sx={{display:'flex',flexDirection:'column',flexGrow:2,ml:2}}>
                {feeds && feeds.length > 0 && (
                    <>
                        <Typography sx={{display:'flex',justifyContent:{xs:'center',sm:'flex-start',md:'flex-start',lg:'center'},fontFamily:'Playfair Display',fontWeight:'bold',fontSize:'20px',mt:5}}>
                            🔍 Recommended Video
                        </Typography>
                        <RecommendedVideo feeds={feeds} xs={"column"} sm={'row'} md={"row"} lg={'column'}/>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default VideoPinDetails;
