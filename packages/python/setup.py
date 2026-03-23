from setuptools import setup, find_packages

setup(
    name="torqvio-client",
    version="2.1.0",
    description="Official Torqvio client library for Python",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Torqvio Team",
    author_email="team@torqvio.com",
    url="https://github.com/torqvio/python-client",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.28.0",
        "socketio-client>=5.0.0",
        "pydantic>=2.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=22.0.0",
            "mypy>=1.0.0",
        ]
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    keywords="torqvio workflow orchestration client sdk",
    project_urls={
        "Documentation": "https://docs.torqvio.com",
        "Source": "https://github.com/torqvio/python-client",
        "Tracker": "https://github.com/torqvio/python-client/issues",
    },
)
