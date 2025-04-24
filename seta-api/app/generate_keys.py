import secrets
import string
import json  # Using json to easily copy/paste the set representation


def generate_licence_key(length=4, groups=4, separator="-"):
    """Generates a random licence key in the specified format."""
    chars = string.ascii_uppercase + string.digits
    key_parts = []
    for _ in range(groups):
        part = "".join(secrets.choice(chars) for _ in range(length))
        key_parts.append(part)
    return separator.join(key_parts)


# Generate 20 unique keys
num_keys_to_generate = 20
generated_keys = set()  # Use a set to automatically handle uniqueness
while len(generated_keys) < num_keys_to_generate:
    generated_keys.add(generate_licence_key())

# Convert set to a sorted list for ordered output file
sorted_keys_list = sorted(list(generated_keys))

# --- Output for main.py ---
# Create a string representation of the set suitable for pasting into Python code
# Using json.dumps ensures correct quoting and formatting for a set literal
# (though we'll manually format it as a set literal below for clarity)

# Direct set literal format is cleaner for pasting:
python_set_string = "{\n"
for key in sorted_keys_list:
    python_set_string += f'    "{key}",\n'
python_set_string += "}"

print("--- Copy this set into main.py (replace the old ACCEPTED_LICENCE_KEY): ---")
print(f"ACCEPTED_LICENCE_KEYS = {python_set_string}")
print("-" * 30)


# --- Output for licence_keys.txt ---
output_filename = "licence_keys.txt"
try:
    with open(output_filename, "w") as f:
        f.write("# Generated SETA Licence Keys\n")
        f.write(f"# Total: {len(sorted_keys_list)}\n")
        f.write("# Format: AAAA-BBBB-CCCC-DDDD\n")
        f.write("------------------------------------\n")
        for key in sorted_keys_list:
            f.write(key + "\n")
    print(
        f"Successfully generated {len(sorted_keys_list)} keys and saved to '{output_filename}'"
    )
except IOError as e:
    print(f"Error writing keys to file '{output_filename}': {e}")

