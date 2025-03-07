const Video = () => {

    return ( 
        <div className="video-container">
            <video id="video-1" controls poster="/storage/video/posters/2-balls-trick.png">
            <source src="/storage/video/2-balls-trick.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-2" controls poster="/storage/video/posters/mymove-shot-feat-anna-wijk.png">
            <source src="/storage/video/mymove-shot-feat-anna-wijk.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-3" controls poster="/storage/video/posters/shoot-on-watermelon.png">
            <source src="/storage/video/shoot-on-watermelon.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-4" controls poster="/storage/video/posters/floorball-golf.png">
            <source src="/storage/video/floorball-golf.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-5" controls poster="/storage/video/posters/mymove-zorro-shoooting.png">
            <source src="/storage/video/mymove-zorro-shoooting.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-6" controls poster="/storage/video/posters/liseberg-challange.png">
            <source src="/storage/video/liseberg-challange.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-7" controls poster="/storage/video/posters/longdistance-shooting.png">
            <source src="/storage/video/longdistance-shooting.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-8" controls poster="/storage/video/posters/mymove-ball-to-the-basket.png">
            <source src="/storage/video/mymove-ball-to-the-basket.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <video id="video-9" controls poster="/storage/video/posters/mymove-do-not-repeat-that.png">
            <source src="/storage/video/mymove-do-not-repeat-that.mp4" type="video/mp4" />
            Ваш браузер не поддерживает встроенные видео :(
            </video>

            <script src="{{ asset('js/video-container.js') }}"></script>
        </div>
    );
}

export default Video;