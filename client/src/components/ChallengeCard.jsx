const ChallengeCard = ({
  challenge,
  onJoin,
  onComplete,
  status
}) => {
  return (
    <div className="dashboard-card">
      <h2>🌱 {challenge.title}</h2>

      <p>{challenge.description}</p>

      <p>Points: {challenge.points}</p>

      <p>Duration: {challenge.duration} days</p>

      <p>Category: {challenge.category}</p>

      {status === "completed" ? (
        <button disabled>Completed</button>
      ) : status === "started" ? (
        <button onClick={() => onComplete(challenge._id)}>
          Complete Challenge
        </button>
      ) : (
        <button onClick={() => onJoin(challenge._id)}>
          Join Challenge
        </button>
      )}
    </div>
  );
};

export default ChallengeCard;