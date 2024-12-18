import './newPrompt.css'

const NewPrompt = () => {
  return (
    <>
    {/* ADD NEW CHAT */}
    <div className="endChat">
        <form className="newForm"action="">
            <label htmlFor="file">
                <img src="/attachment.png" alt="" />
            </label>
            <input id="file" type="file" multiple={false} hidden />
            <input type="text" placeholder='Ask Anything...' />
        </form>
    </div>
    </>
  )
}

export default NewPrompt;