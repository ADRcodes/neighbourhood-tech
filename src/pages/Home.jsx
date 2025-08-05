import Sample from '../components/Sample.jsx'

const Home = () => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center max-w-2xl h-64 m-auto my-[100px] p-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition-all duration-700">
      <h1 className="text-3xl font-bold animate-pulse ">Hello world!</h1>
      <Sample />
      <p className="btn">Sample button</p>
    </div>
  )
}

export default Home