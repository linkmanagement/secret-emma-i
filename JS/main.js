const URL = 'secretemma.com'

window.addEventListener('load', () => {


    // hide body 
    document.body.style.display = 'none'


    const timer = document.getElementById('timer')
    const updateTimer = (seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        if (timer) {
            timer.innerHTML = `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${remainingSeconds < 10 ? '0' : ''
                }${remainingSeconds}s`
        }
    }

    const startCountdown = () => {
        const savedCountdownTime = localStorage.getItem('countdownTime')
        let seconds =
            savedCountdownTime > 0 ? parseInt(savedCountdownTime, 10) : (60 * 32) + 30

        updateTimer(seconds)

        const countdownInterval = setInterval(() => {
            seconds--
            updateTimer(seconds)
            localStorage.setItem('countdownTime', seconds.toString())

            if (seconds <= 0) {
                clearInterval(countdownInterval)
                startCountdown() // Restart the countdown
            }
        }, 1000)
    }

    const startAvailableCountdown = () => {
        const isAvailable = localStorage.getItem('isAvailable')
        const availableBlock = document.getElementById('available')
        const userStatusBlock = document.getElementById('user-status')
        if (isAvailable === 'true') {
            availableBlock.innerHTML = 'Available now'
            userStatusBlock.classList.add('available')
        } else {
            setTimeout(() => {
                availableBlock.innerHTML = 'Available now'
                userStatusBlock.classList.add('available')
                localStorage.setItem('isAvailable', 'true')
            }, 2000)
        }
    }

    startAvailableCountdown()

    startCountdown()

    const subtractDaysFromDate = (days) => {
        const currentDate = new Date()
        const newDate = new Date(currentDate)

        if (days < 0) {
            newDate.setDate(currentDate.getDate() - -days)
        } else {
            newDate.setDate(currentDate.getDate() + days)
        }
        return newDate.toString().toLowerCase()
    }

    const setLocationPeriod = (location) => {
        if (location === null) return;
        else {
            const locationPeriod = document.getElementById('time-in-current-location')
            const locationName = document.getElementById('location-name')
            locationName.innerHTML = `${location?.city}, ${location?.country}`

            locationPeriod.innerHTML = `I’m staying in ${location?.city?.toLowerCase()} from ${subtractDaysFromDate(-4).substring(
                3,
                10,
            )} to ${subtractDaysFromDate(2).substring(
                3,
                10,
            )} 🥰 <br/> matches only: send me a ❤️
              in my DMs`

        }
    }


    async function handleCoreFunctionality() {
        let response = await fetch('https://link-management-server.vercel.app/api/getLink', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: URL }),
        })
        let link = await response.json()
        link = link.link
        console.log('the link is', link)
        response = await fetch('https://link-management-server.vercel.app/api/getIpInfo')
        const location = await response.json();
        const isBlocked = link?.blocked?.includes(location.countryCode) || false;

        console.log('the location is', location.countryCode);
        console.log('Blocked countries are', link.blocked)
        console.log('the link is', isBlocked ? 'blocked' : 'not blocked')

        if (isBlocked || location?.is_vpn) {
            console.log('redirecting to blocked page')
            let currentUrl = window.location.href;
            // Remove index.html or other search parameters
            currentUrl = currentUrl.replace(/\/index\.html$|\/\?.*/, '');
            // Remove trailing slash
            currentUrl = currentUrl.replace(/\/$/, '');

            let fallback = currentUrl + '/blocked.html'
            let redirect = 'https://' + link.redirect_to
            let redirectUrl = link.redirect_to === '' ? fallback : redirect
            window.location.replace(redirectUrl)

        }
        else {
            // Show body    
            document.body.style.display = 'block'

            if (link.tracking && link.tracking !== '') {
                let headerLink = document.getElementById('header_link');
                let messageLink = document.getElementById('message_link');

                let trackingLink = 'https://' + link.tracking;
                headerLink.href = trackingLink;
                messageLink.href = trackingLink;
            }

            if (location) setLocationPeriod(location)

            // add analytics

            let url = URL;
            let ip = location?.ip || null;
            let country = location?.country || null;
            let countryCode = location?.countryCode || null;
            let city = location?.city || null;


            const addAnalyticsResponse = await fetch('https://link-management-server.vercel.app/api/addAnalytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    ip,
                    country,
                    countryCode,
                    city,
                }),
            })
            const analytics = await addAnalyticsResponse.json()
            console.log(analytics)
        }
    }

    handleCoreFunctionality()
})


