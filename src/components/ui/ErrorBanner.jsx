export default function ErrorBanner({message}) {
    if (!message) return null

    return (
        <article style={{background: 'var(--pico-del-color)', color: 'white'}}>
            {message}
        </article>
    )
}