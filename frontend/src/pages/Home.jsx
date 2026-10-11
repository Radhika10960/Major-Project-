import React from "react"
import { useState } from "react"
import axios from "axios"

const Home = () => {
    const [inputValue, setInputValue] = useState("")
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(null)
    const [error, setError] = useState("")

    const apiURL = import.meta.env.VITE_BACKEND_API_URL

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        // console.log("form submitted")
        if (!inputValue.trim()) return
        
        setLoading(true)
        setResponse(null)
        setError(null)

        // setTimeout(() => {
        //     setResponse("http://localhost:5173")
        //     setLoading(false)
        // }, 3000);

        try {
            const res = await axios.post(`${apiURL}/repositories/analyze`, {
                url: inputValue 
            })
            setResponse(res.data)
            console.log(res)
        }
        catch (error) {
            setError(error.response?.data?.message || "Something went wrong")
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl mb-4">Website Generator</h1>
            <form onSubmit={handleFormSubmit}>
                {error && <p className="text-red-500">{error}</p>}
                {loading && <p className="text-blue-500">Loading...</p>}
                {response && <p className="text-green-500">Response : {response.data?.message} </p>}

                <div className="flex flex-col items-center justify-center">
                    <label htmlFor="inputValue">GitHub URL</label>
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        required
                        type="text"
                        id="inputValue"
                        name="inputValue"
                        placeholder="enter the repo URL"
                        className="border-2 border-gray-300 rounded-md p-2" />
                </div>
                <div className="flex items-center justify-center">
                    <button
                        disabled={loading}
                        className="bg-green-600 px-2 py-1 rounded-md text-white mt-3"
                        type="submit">
                            { loading ? "Generating..." : "Generate Website" }
                        </button>
                </div>
            </form>
        </div>
    );
};

export default Home;