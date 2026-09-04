import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
import json
import numpy as np
import tensorflow as tf

def test_inference():
    model_path = os.path.abspath("models/final_model.keras")
    print(f"Loading model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    print("Model loaded successfully!")
    
    with open("models/class_indices.json") as f:
        class_indices = json.load(f)
    print("Class indices:", class_indices)

    with open("models/class_thresholds.json") as f:
        class_thresholds = json.load(f)
    print("Class thresholds:", class_thresholds)

    # Test array (224, 224, 3)
    dummy_input = np.random.uniform(0, 255, (1, 224, 224, 3)).astype(np.float32) / 255.0
    preds = model.predict(dummy_input)[0]
    print("Raw predictions:", preds)
    
    idx_to_class = {v: k for k, v in class_indices.items()}
    prob_dict = {idx_to_class[i]: float(preds[i]) for i in range(len(preds))}
    print("Probabilities:", prob_dict)

if __name__ == "__main__":
    test_inference()
