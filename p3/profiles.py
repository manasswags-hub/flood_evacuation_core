# p3/profiles.py

"""
P3 User Personalization Profiles

P2 handles objective safety.
P3 uses these profiles to apply user-specific preferences.
"""

PROFILES = {
    "elderly": {
        "safety": 0.40,
        "distance": 0.20,
        "accessibility": 0.25,
        "eta": 0.15
    },

    "walking": {
        "safety": 0.40,
        "distance": 0.25,
        "accessibility": 0.20,
        "eta": 0.15
    },

    "two_wheeler": {
        "safety": 0.45,
        "distance": 0.15,
        "accessibility": 0.10,
        "eta": 0.15,
        "road_condition": 0.15
    },

    "four_wheeler": {
        "safety": 0.45,
        "distance": 0.10,
        "accessibility": 0.10,
        "eta": 0.15,
        "road_condition": 0.20
    }
}


def get_profile(profile_name):
    """
    Return the personalization weights for a user profile.
    """

    profile_name = profile_name.lower()

    if profile_name not in PROFILES:
        raise ValueError(
            f"Unknown profile: {profile_name}. "
            f"Available profiles: {list(PROFILES.keys())}"
        )

    return PROFILES[profile_name]