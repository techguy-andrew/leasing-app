export default function TestPage() {
  return (
    <div style={{ padding: '40px', backgroundColor: 'red', color: 'white', fontSize: '24px' }}>
      <h1>TEST PAGE - If you can see this, the server works!</h1>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  )
}
