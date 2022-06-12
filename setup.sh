#!/bin/bash

(conda > /dev/null 2>&1 && echo "conda exists") || { echo "You need to install Anaconda/Miniconda (https://docs.conda.io/en/latest/miniconda.html)!" ; exit; }

#(gcc --version > /dev/null 2>&1 && echo "gcc exists") || { echo "You need to install gcc (https://gcc.gnu.org/install/)!" ; exit; }

if [ -f ~/.nvm/nvm.sh ]; then
  echo 'nvm exists'
else
  echo 'missing nvm'
  echo 'installing nvm'
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
fi
. ~/.nvm/nvm.sh
nvm install 12.22.7
nvm use 12.22.7

CONDA_BASE=$(conda info --base)
source $CONDA_BASE/etc/profile.d/conda.sh

echo 'creating conda environment: dialogue_eval'
conda create -y --name dialogue_eval python=3.8 pip || exit
conda activate dialogue_eval || exit

echo 'retrieving parlai'
git clone https://github.com/facebookresearch/ParlAI.git
cd ParlAI || exit
git checkout d9548b567d8c5a271b157e9a8bbbf9a24714a2a1
echo 'installing parlai'
pip install markdown==3.3.4
python setup.py develop || pip install -r requirements.txt || exit
cd ..

echo 'retrieving mephisto'
git clone https://github.com/facebookresearch/mephisto.git
cd mephisto || exit
git checkout 137d128f1b0f326186b83ed8b08c11447d64f640
echo 'installing mephisto'
pip install -e . || exit

